'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SyncStatusChip } from '@/components/features/catalog/SyncStatusChip';
import { StockStatusBadge } from '@/components/features/catalog/StockStatusBadge';
import { StockAdjustDialog } from '@/components/features/inventory/StockAdjustDialog';
import { OutboxReviewPanel } from '@/components/offline/OutboxReviewPanel';
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';
import { useCommercialCatalog } from '@/hooks/useCommercialCatalog';
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  type CommercialCatalogRow,
} from '@/lib/catalog/commercialTypes';
import { ROUTES } from '@/lib/routes';
import { TableRowsSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function formatMoney(n: number | null) {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function InventarioInner() {
  const cat = useCommercialCatalog();
  const [lowOnly, setLowOnly] = useState(false);
  const [showOutbox, setShowOutbox] = useState(false);
  const [adjustRow, setAdjustRow] = useState<CommercialCatalogRow | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const threshold = DEFAULT_LOW_STOCK_THRESHOLD;

  const rows = useMemo(() => {
    let list = cat.rows;
    if (lowOnly) {
      list = list.filter((r) => (r.availableStock ?? r.currentStock ?? 0) <= threshold);
    }
    return list;
  }, [cat.rows, lowOnly, threshold]);

  const lowCount = useMemo(
    () => cat.rows.filter((r) => (r.availableStock ?? r.currentStock ?? 0) <= threshold).length,
    [cat.rows, threshold]
  );

  if (!cat.canRead) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
        Inicia sesión con un usuario de empresa para ver el inventario.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5" data-testid="commercial-inventory-page">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-[#1e1e1e] sm:text-2xl">
            Inventario comercial
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stock desde BusinessProduct · precio customPrice ·{' '}
            {cat.isAdmin ? 'ADMIN' : 'EMPLOYEE'}
          </p>
          <div className="mt-2 hidden sm:block">
            <SyncStatusBadge scope={cat.scope} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 lg:h-9"
            disabled={cat.syncing}
            onClick={() => void cat.syncNow()}
          >
            <RefreshCw className={cn('h-4 w-4', cat.syncing && 'motion-safe:animate-spin')} />
            Sincronizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 lg:h-9"
            onClick={() => setShowOutbox((v) => !v)}
            aria-expanded={showOutbox}
          >
            Cola
          </Button>
          <Button variant="outline" size="sm" className="h-10 lg:h-9" asChild>
            <Link href={ROUTES.PRODUCTS}>Catálogo</Link>
          </Button>
          <Button variant="outline" size="sm" className="h-10 gap-2 lg:h-9" asChild>
            <Link href={ROUTES.SALES}>
              <ShoppingCart className="h-4 w-4" />
              POS
            </Link>
          </Button>
        </div>
      </div>

      {flash ? (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="status"
        >
          {flash}
        </div>
      ) : null}

      {cat.error ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {cat.error}
        </div>
      ) : null}

      {lowCount > 0 ? (
        <div
          className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          data-testid="low-stock-alert"
          role="status"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {lowCount} producto(s) con stock disponible ≤ {threshold} (umbral UI local; minStock no
            viaja en pull BP).
          </span>
        </div>
      ) : null}

      <div className="sticky top-0 z-10 -mx-1 flex flex-col gap-3 rounded-md bg-[#F3F4F6]/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-[#F3F4F6]/90 sm:static sm:mx-0 sm:flex-row sm:items-center sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 pl-9 sm:h-10"
            placeholder="Buscar nombre, SKU o categoría…"
            value={cat.search}
            onChange={(e) => cat.setSearch(e.target.value)}
            data-testid="inventory-search"
            aria-label="Buscar en inventario"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Visibilidad</span>
          <select
            className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e1e1e] sm:h-10"
            value={cat.visibility}
            onChange={(e) => cat.setVisibility(e.target.value as typeof cat.visibility)}
            aria-label="Filtrar por visibilidad"
          >
            <option value="all">Todos</option>
            <option value="private">Privados</option>
            <option value="shared">Compartidos adoptados</option>
          </select>
        </label>
        <label className="flex h-11 items-center gap-2 rounded-md border border-transparent px-1 text-sm sm:h-10">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#1e1e1e]"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            data-testid="inventory-low-only"
          />
          Solo stock bajo
        </label>
      </div>

      {showOutbox && cat.scope ? <OutboxReviewPanel scope={cat.scope} /> : null}

      <div className="overflow-hidden rounded-lg border bg-white">
        {cat.loading ? (
          <TableRowsSkeleton rows={6} />
        ) : rows.length === 0 ? (
          <div className="space-y-3 p-8 text-center" data-testid="inventory-empty">
            <p className="text-sm text-muted-foreground">
              {lowOnly
                ? 'Ningún producto cumple el filtro de stock bajo.'
                : 'Sin filas de inventario comercial. Sincroniza o adopta productos en el catálogo.'}
            </p>
            {!lowOnly ? (
              <Button variant="outline" className="h-10" asChild>
                <Link href={ROUTES.PRODUCTS}>Ir a catálogo</Link>
              </Button>
            ) : (
              <Button variant="outline" className="h-10" onClick={() => setLowOnly(false)}>
                Ver todos
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm" data-testid="inventory-table">
                <thead className="border-b bg-[#f7f7f7] text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Precio</th>
                    <th className="px-4 py-3 font-medium">Actual</th>
                    <th className="px-4 py-3 font-medium">Reservado</th>
                    <th className="px-4 py-3 font-medium">Disponible</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Sync</th>
                    <th className="px-4 py-3 font-medium">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const low = (row.availableStock ?? row.currentStock ?? 0) <= threshold;
                    const canAdj =
                      cat.canAdjustStock &&
                      row.bpServerId != null &&
                      row.bpVersion != null &&
                      row.bpLocalId != null;
                    return (
                      <tr
                        key={row.productLocalId}
                        className={cn(
                          'border-b last:border-0 transition-colors motion-reduce:transition-none hover:bg-slate-50/80 focus-within:bg-slate-50/80',
                          low && 'bg-amber-50/40'
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-[#1e1e1e]">{row.name}</td>
                        <td className="px-4 py-3 font-mono text-xs">{row.sku || '—'}</td>
                        <td className="px-4 py-3">{row.categoryName}</td>
                        <td className="px-4 py-3 tabular-nums">{formatMoney(row.customPrice)}</td>
                        <td className="px-4 py-3 tabular-nums">{row.currentStock ?? '—'}</td>
                        <td className="px-4 py-3 tabular-nums">{row.reservedStock ?? '—'}</td>
                        <td className="px-4 py-3 tabular-nums font-medium">
                          {row.availableStock ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StockStatusBadge
                            available={row.availableStock ?? row.currentStock}
                            lowThreshold={threshold}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <SyncStatusChip status={row.syncStatus} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {canAdj ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9"
                              onClick={() => setAdjustRow(row)}
                            >
                              Ajustar
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 lg:hidden" data-testid="inventory-mobile-list">
              {rows.map((row) => {
                const low = (row.availableStock ?? row.currentStock ?? 0) <= threshold;
                const canAdj =
                  cat.canAdjustStock &&
                  row.bpServerId != null &&
                  row.bpVersion != null &&
                  row.bpLocalId != null;
                return (
                  <article
                    key={row.productLocalId}
                    className={cn(
                      'rounded-md border bg-[#fafafa] p-3',
                      low && 'border-amber-300 bg-amber-50/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-[#1e1e1e]">{row.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {row.sku || 'Sin SKU'} · {row.categoryName}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <StockStatusBadge
                          available={row.availableStock ?? row.currentStock}
                          lowThreshold={threshold}
                        />
                        <SyncStatusChip status={row.syncStatus} />
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Actual</div>
                        <div className="font-medium tabular-nums">{row.currentStock ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Reserv.</div>
                        <div className="font-medium tabular-nums">{row.reservedStock ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Dispon.</div>
                        <div className="font-medium tabular-nums">{row.availableStock ?? '—'}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold tabular-nums text-[#1e1e1e]">
                        Bs {formatMoney(row.customPrice)}
                      </span>
                      {canAdj ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-10 min-w-[5.5rem]"
                          onClick={() => setAdjustRow(row)}
                        >
                          Ajustar
                        </Button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      <StockAdjustDialog
        open={!!adjustRow}
        row={adjustRow}
        onClose={() => setAdjustRow(null)}
        onSubmit={async ({ delta, reason }) => {
          if (!adjustRow?.bpLocalId || adjustRow.bpServerId == null || adjustRow.bpVersion == null) {
            throw new Error('BP no versionado');
          }
          await cat.adjust({
            bpLocalId: adjustRow.bpLocalId,
            businessProductServerId: adjustRow.bpServerId,
            baseVersion: adjustRow.bpVersion,
            delta,
            reason,
          });
          setFlash(
            `Ajuste encolado (pending, delta ${delta}). Stock local optimista — sin InventoryTransaction hasta ack.`
          );
        }}
      />
    </div>
  );
}

export default function InventarioPage() {
  return (
    <ProtectedRoute>
      <InventarioInner />
    </ProtectedRoute>
  );
}
