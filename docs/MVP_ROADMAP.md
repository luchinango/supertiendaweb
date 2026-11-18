# MVP_ROADMAP — Roadmap alineado a CODEMEDIIA / SuperTienda

**Versión:** 1.1 — 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Detalle de ejecución:** [`PHASE_1_IMPLEMENTATION_PLAN.md`](./PHASE_1_IMPLEMENTATION_PLAN.md)

---

## Hechos verificados

- Fase 0 documental completada (12 docs base + actualizaciones 1.1).
- Schema/servicios adelantan núcleo y POS; cableado E2E incompleto.
- Offline, multidevice QR real, Payments/FactuBo/Alicia/WordPress: no implementados en este repo.
- Riesgo: integrar pagos externos o offline antes de API online confiable.

---

## Decisiones aprobadas

Orden estratégico:

0. Auditoría (hecha)  
1. Núcleo comercial + seguridad/DB  
2. POS y administración online  
3. Offline individual (1ª versión comercial)  
4. POS multidispositivo (auxiliar)  
5. Integraciones vía productos independientes + piloto  
6. Offline multicaja  
7. Expansión (WordPress, Alicia, Analytics, menús)

Prioridades de implementación en SuperTienda (renumeradas):

| Prioridad | Alcance |
|-----------|---------|
| **P0** | Seguridad y aislamiento multiempresa |
| **P1** | Integridad y base de datos (Prisma Migrate, backups, FK) |
| **P2** | API comercial TSOA (customers, inventory, sales, caja, POS) |
| **P3** | Frontend funcional (POS real, caja, stock) |
| **P4** | Preparación comercial (catálogo, fotos, variantes, import, monedas, reportes, móvil) |
| **P5** | Offline individual |

**Fuera del MVP de este repo:** SDKs Red Enlace, FactuBo, Alicia, Payments, WordPress, menús digitales, NFC pago, restricciones por plan sin definición comercial.

Offline individual incluido en primera versión comercial. Multicaja y WordPress no son MVP inicial.

---

## Recomendaciones técnicas

### MVP demostrable en SuperTienda

1. Login seguro (sin bypass en demos compartidas)
2. Productos/categorías/stock por empresa
3. Clientes y proveedores básicos
4. Abrir caja → vender POS (efectivo u otros medios locales) → cerrar caja
5. Stock y ventas actualizados
6. Luego: POS offline individual + sync

Cobros QR / FactuBo: cuando existan los productos externos; SuperTienda solo contratos + UI de estados.

### Primer paquete entregable (P0–P3)

Enfocado en verdad operativa online. Ver estimaciones y AC en [`PHASE_1_IMPLEMENTATION_PLAN.md`](./PHASE_1_IMPLEMENTATION_PLAN.md).

### Continuación (P4 luego P5)

- P4 no bloquea POS E2E mínimo pero sí verticales (peso/variantes/import).
- P5 requiere idempotencia ya introducida en P2.

### Criterios de salida

| Hito | Hecho |
|------|-------|
| Seguridad P0 | Sin bypass en release; `businessId`/`userId` desde JWT |
| Migrate P1 | Migraciones versionadas aplicables en limpio + backup documentado |
| API POS | Venta vía Swagger con caja abierta y stock descontado |
| UI POS E2E | Cobro efectivo en `/ventas` persistido en DB |
| Offline v1 | Venta sin red + sync sin duplicar |

### Planes comerciales (software único)

| Plan | Capacidades (provisional) |
|------|---------------------------|
| Emprendedor | Móvil, catálogo, inventario, POS básico (+ offline cuando P5) |
| Negocios | + PC, empleados, reportes, auxiliar QR cuando Payments exista |
| Empresarial | + sucursales, multicaja, offline LAN después |

No implementar feature flags de plan hasta validación comercial.

---

## Funcionalidades futuras

- Integración real con CODEMEDIIA Payments / FactuBo / Alicia.
- Plugin WordPress, Analytics MLOps, menús digitales, NFC.

---

## Decisiones pendientes

1. ¿Offline bloquea el primer release vendible o va en release +1 tras POS online?
2. ¿CSV/variantes/pedidos online antes del piloto?
3. Fecha interna del hito POS E2E.
4. Quién aprueba Fase 1 de código.
5. Confirmado: Prisma Migrate entra en P1 (default del plan Fase 1).
