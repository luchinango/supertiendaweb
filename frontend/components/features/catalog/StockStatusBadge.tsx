'use client';

import { cn } from '@/lib/utils';

export type StockTone = 'ok' | 'low' | 'out' | 'unknown';

/** Badge visual de stock — no altera umbrales ni lógica comercial. */
export function resolveStockTone(
  available: number | null | undefined,
  lowThreshold: number
): StockTone {
  if (available == null || Number.isNaN(Number(available))) return 'unknown';
  const n = Number(available);
  if (n <= 0) return 'out';
  if (n <= lowThreshold) return 'low';
  return 'ok';
}

const STYLES: Record<StockTone, string> = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  low: 'border-amber-300 bg-amber-50 text-amber-950',
  out: 'border-red-200 bg-red-50 text-red-900',
  unknown: 'border-slate-200 bg-slate-50 text-slate-600',
};

const LABELS: Record<StockTone, string> = {
  ok: 'OK',
  low: 'Bajo',
  out: 'Agotado',
  unknown: '—',
};

export function StockStatusBadge({
  available,
  lowThreshold,
  className,
}: {
  available: number | null | undefined;
  lowThreshold: number;
  className?: string;
}) {
  const tone = resolveStockTone(available, lowThreshold);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium',
        STYLES[tone],
        className
      )}
      data-testid={`stock-badge-${tone}`}
    >
      {LABELS[tone]}
    </span>
  );
}
