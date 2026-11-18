# PROJECT_CONTEXT — SuperTienda by CODEMEDIIA

**Versión:** 1.1 — 16 de noviembre de 2026  
**Fase:** 0 documentada; alineación post plan maestro consolidado  
**Producto:** SuperTienda  
**Empresa:** CODEMEDIIA ([codemediia.com](https://www.codemediia.com))  
**Repositorio técnico:** `supertiendaweb` (`c:\Proyectos\supertiendaweb`)

---

## Hechos verificados

### Identidad en documentación vs código

| Denominación aprobada | Uso |
|-----------------------|-----|
| **CODEMEDIIA** (doble i) | Empresa |
| **SuperTienda** (una palabra) | Producto |
| **SuperTienda by CODEMEDIIA** | Presentación comercial |

Referencias antiguas aún presentes en código o docs previos (no renombrar automáticamente IDs técnicos):

- `CodeMedia` / `CodeMedia` sin doble i
- `Super Tienda` (con espacio)
- `eGrocery System` en `frontend/app/layout.tsx`
- Nombres de paquete/repo: `supertienda`, `supertiendaweb`, `backend`

### Producto y repositorio

- Monorepo de dos apps: `frontend/` (Next.js) y `backend/` (Express + Prisma). Sin workspace root unificado.
- Frontend `supertienda` 0.1.0; backend `backend` 1.0.0.
- Remote Git: `https://github.com/luchinango/supertiendaweb.git` (rama `master` alineada localmente; actividad remota hasta jul 2025).
- Carpeta `docs/` creada en Fase 0; `.gitignore` permite versionar `docs/**/*.md`.
- Existe `backups/` (diagramas, `public.sql`), gitignored.

### Stack técnico verificado

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js ^15.3.4, React ^19.1.0, Tailwind CSS ^4.1.10, shadcn/Radix, SWR, axios, react-hook-form, recharts |
| Backend | Express ^5.1.0, TSOA ^6.6.0, Prisma ^6.10.1, PostgreSQL, JWT RS256, bcryptjs, Winston, Swagger UI |
| Base de datos | PostgreSQL vía Prisma; extensiones `pg_trgm`, `btree_gin` |

### Estado funcional general

- Núcleo comercial **modelado** en Prisma; API TSOA viva parcial (auth, users, businesses, catálogo, suppliers, purchase-orders).
- POS/ventas/caja/clientes/inventario: servicios/controllers **huérfanos** (no registrados en TSOA).
- UI ventas con carrito en memoria; checkout stub.
- Sin PWA/offline, sin SDK Red Enlace, sin FactuBo, Alicia ni plugin WordPress en este repo.

---

## Decisiones aprobadas

1. SuperTienda es el primer producto del ecosistema modular CODEMEDIIA.
2. Producto **genérico, configurable y demostrable**; sin personalizaciones exclusivas de un piloto no confirmado.
3. Verticales: supermercados/minimarkets, ropa, ferreterías/repuestos, minoristas, servicios.
4. **Los demás productos se desarrollan en proyectos y repositorios independientes** (Payments, FactuBo, Alicia, Analytics, menús digitales).
5. SuperTienda no implementa Red Enlace, FactuBo, Alicia ni menús digitales completos dentro de este repo.
6. Online + **offline individual** en la primera versión comercial; offline multicaja después.
7. Multidispositivo: PC, celular autónomo, celular auxiliar QR (cobros reales vía Payments, etapa posterior).
8. Un solo producto SuperTienda con planes Emprendedor / Negocios / Empresarial (límites comerciales pendientes).
9. No reescribir el proyecto desde cero sin justificación aprobada; recuperar e integrar código existente.
10. No renombrar automáticamente repos, paquetes, rutas, tablas ni identificadores técnicos.

---

## Recomendaciones técnicas

1. Tratar el repo como base de **monolito modular**, no greenfield.
2. Cerrar brecha UI ↔ API ↔ dominio antes de offline e integraciones externas.
3. Facturación electrónica real → FactuBo (repo aparte); cobros QR → CODEMEDIIA Payments (repo aparte).
4. Usar `docs/` como fuente de contexto; ver [`ECOSYSTEM_BOUNDARIES.md`](./ECOSYSTEM_BOUNDARIES.md) y [`PHASE_1_IMPLEMENTATION_PLAN.md`](./PHASE_1_IMPLEMENTATION_PLAN.md).
5. Corregir copy de UI a “SuperTienda” / “CODEMEDIIA” cuando se toquen pantallas (sin rename técnico masivo).

---

## Funcionalidades futuras (fuera de este repo / MVP)

- CODEMEDIIA Payments, FactuBo, Alicia, Analytics, plugin WordPress, menús digitales, NFC pago bancario.

---

## Decisiones pendientes

1. Vertical prioritario para demo/piloto.
2. Criterios exactos de planes Emprendedor / Negocios / Empresarial.
3. Fecha y alcance del primer piloto.
4. Prefijo formal de API `/api/v1` en Fase 1.
5. Calendario de corrección de strings residuales `eGrocery System` en UI.
