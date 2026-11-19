# P2-C1.G9 — Roadmap UX/UI

## P0 / P1 — Quick wins (G9.1)

| # | Ítem | Riesgo lógica comercial |
|---|------|-------------------------|
| 1 | Auth sin AppShell | Ninguno |
| 2 | Dashboard ES + CTA Ventas; quitar caja/logout duplicados | Ninguno (solo UI) |
| 3 | Sidebar agrupado + filtro EMPLOYEE (solo visibilidad nav) | Bajo — no cambia API/permisos server |
| 4 | Skeleton loading catálogo/POS | Ninguno |
| 5 | Badge offline sin tapar cobro (reposicionar) | Ninguno |
| 6 | CTA primary consistente en puntos tocados | Ninguno |

## P2 — Estructural (post G9.1)

- Modo cajero móvil (menos paneles arriba).
- Tablas → cards `<md`.
- Atajos teclado POS.
- Empty states ilustrados.
- Config con datos reales (sacar mock).

## P3

- Branding por empresa; dark mode controlado; métricas de fricción.

## Criterios de aceptación (referencia)

- Auth pages sin nav de app.
- UI en español en superficies tocadas.
- Cajero: ≤ 6 destinos primarios visibles (resto agrupado/oculto por rol).
- Skeleton en carga de catálogo POS/admin.
- Badge offline no cubre “Cobrar”.
