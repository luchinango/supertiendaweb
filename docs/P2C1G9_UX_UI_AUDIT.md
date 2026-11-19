# P2-C1.G9 — Auditoría UX/UI

**Fecha:** 18/11/2026  
**Entorno:** FE `next start` `st-fe-prod-g8` (`127.0.0.1:3001`), datos DEMO  
**Alcance:** Diagnóstico de experiencia (chat G9). Evidencias: `docs/p2c1g9-evidence/`  
**Sin implementación en G9.** Quick wins: ver G9.1.

---

## 1. Mapa del producto (rutas reales)

| Área | Rutas | Notas |
|------|-------|-------|
| Shell | `AppShell` + `Sidebar` (14 ítems) | Envuelve **toda** la app vía `app/layout.tsx` |
| Auth | `/login`, `/register` | Layout `(auth)` anida providers; **sigue** bajo AppShell raíz |
| POS | `/ventas` | Módulo más maduro (caja, jornada, offline, ticket) |
| Catálogo / Inventario | `/productos`, `/inventario` | Coherentes (P2-D) |
| Dashboard | `/dashboard` | Esquelético, strings EN, caja/logout duplicados |
| Config | `/configuraciones` | UI rica; datos mock locales |
| Otros | movimientos, mermas, empleados, clientes, proveedores, créditos, alertas, OC, estadísticas | Existen |
| Debug | `/debug-offline`, `/debug-auth` | Gateados en prod |

---

## 2. Fortalezas

- POS concentra caja, jornada, offline y cobro.
- Skip link + `aria-current` en nav.
- Tokens shadcn + Lucide; CTA `#1e1e1e` en módulos recientes.
- Ticket no fiscal 80/58 (G8).
- Cola cajero → Control de jornada (G8).

---

## 3. Problemas por severidad

### Crítico
| ID | Hallazgo | Evidencia |
|----|----------|-----------|
| C1 | Dashboard desalineado del POS (EN, caja/logout sueltos) | `02-dashboard-desktop.png` |
| C2 | Login con sidebar de app sin sesión | `01-login-desktop.png` |
| C3 | Móvil: jornada+caja empujan catálogo; cobro tras “Carrito” | `03-ventas-mobile.png` |

### Alto
| ID | Hallazgo |
|----|----------|
| A1 | Menú plano 14 ítems sin agrupación/rol |
| A2 | CTAs inconsistentes (filled / outline / texto) |
| A3 | Doble indicador online (header + floater) |
| A4 | Tablas difíciles en móvil |
| A5 | “Guardar cambios” de baja affordance en config |

### Medio / Bajo
M1 sidebar inline styles · M2 empty/loading sin skeleton · M4 login azul vs app gris · B3 aria en avatar.

---

## 4. Responsive por rol

| Rol | Prioridad viewport |
|-----|-------------------|
| Cajero | Desktop primario; móvil usable no idéntico |
| Admin catálogo | Desktop/tablet; móvil → cards |
| Config | Desktop-first |

---

## 5. A11y / rendimiento percibido

- Skip link: OK.
- Focus: parcial (sidebar inline débil).
- CLS: riesgo al pasar de “Cargando…” a grid/tabla.
- Atajos teclado POS: ausentes.

---

## 6. Evidencias G9

`01-login-*`, `02-dashboard-desktop`, `03-ventas-{desktop,tablet,mobile,mobile-menu}`, `04-catalogo-desktop`, `05-inventario-desktop`, `06-config-desktop`.
