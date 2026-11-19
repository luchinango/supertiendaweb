# P2-C1.G9 — Propuesta de design system

**Estado:** propuesta (G9). Quick wins G9.1 alinean tokens mínimos sin migración total.

## Dirección visual

Retail operativo BO — sobrio, alto contraste. Evitar purple-AI, cream-serif, glow.

| Token | Valor |
|-------|--------|
| Ink / primary CTA | `#1e1e1e` / hover `#2e2e2e` |
| Surface app | `#F3F4F6` (`gray-100`/`gray-200`) |
| Surface card | `#FFFFFF` |
| Status online / OK | emerald (solo status) |
| Danger | rojo solo destructivo |
| Radius | `8px` (`rounded-md`/`lg`) |
| Tipo UI | Inter actual → evolucionar a una sola familia UI + tabular nums |

## Componentes canónicos

`Button` primary/secondary/ghost/danger · `PageHeader` · `StatusPill` · `ProductTile` · `DataTable`/`CardList` · `EmptyState` · `Skeleton` · `Toast` · `Sheet` (carrito móvil) · `CashBar`.

## Microinteracciones (POS)

- Sync/cobro: spinner + toast corto; sin confetti.
- Loading: skeleton, no solo texto.
- `prefers-reduced-motion`: respetar.
- Focus: ring 2px ink.

## Migración

1. Quick wins (G9.1): auth shell, dashboard, nav grupos, skeleton, badge.
2. Sustituir estilos inline del Sidebar por Tailwind.
3. Unificar CTAs en módulos legacy.
