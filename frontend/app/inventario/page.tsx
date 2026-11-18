'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SyncStatusChip } from '@/components/features/catalog/SyncStatusChip';
import { StockAdjustDialog } from '@/components/features/inventory/StockAdjustDialog';
import { OutboxReviewPanel } from '@/components/offline/OutboxReviewPanel';
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';
import { useCommercialCatalog } from '@/hooks/useCommercialCatalog';
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  type CommercialCatalogRow,
} from '@/lib/catalog/commercialTypes';
import { ROUTES } from '@/lib/routes';

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
    <div className="space-y-5" data-testid="commercial-inventory-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1e1e1e]">Inventario comercial</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stock desde BusinessProduct · precio customPrice ·{' '}
            {cat.isAdmin ? 'ADMIN' : 'EMPLOYEE'}
          </p>
          <div className="mt-2">
            <SyncStatusBadge scope={cat.scope} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={cat.syncing}
            onClick={() => void cat.syncNow()}
          >
            <RefreshCw className={`h-4 w-4 ${cat.syncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowOutbox((v) => !v)}>
            Cola / conflictos
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.PRODUCTS}>Ir a catálogo</Link>
          </Button>
        </div>
      </div>

      {flash ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {flash}
        </div>
      ) : null}

      {cat.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {cat.error}
        </div>
      ) : null}

      {lowCount > 0 ? (
        <div
          className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          data-testid="low-stock-alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {lowCount} producto(s) con stock disponible ≤ {threshold} (umbral UI local; minStock no
            viaja en pull BP).
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar nombre, SKU o categoría…"
            value={cat.search}
            onChange={(e) => cat.setSearch(e.target.value)}
            data-testid="inventory-search"
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={cat.visibility}
          onChange={(e) => cat.setVisibility(e.target.value as typeof cat.visibility)}
        >
          <option value="all">Todos</option>
          <option value="private">Privados</option>
          <option value="shared">Compartidos adoptados</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
          />
          Solo stock bajo
        </label>
      </div>

      {showOutbox && cat.scope ? <OutboxReviewPanel scope={cat.scope} /> : null}

      <div className="overflow-hidden rounded-lg border bg-white">
        {cat.loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Cargando inventario local…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground" data-testid="inventory-empty">
            Sin filas de inventario comercial. Sincroniza o adopta productos en el catálogo.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
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
                    <th className="px-4 py-3 font-medium">Sync</th>
                    <th className="px-4 py-3 font-medium" />
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
                        className={`border-b last:border-0 hover:bg-slate-50/80 ${low ? 'bg-amber-50/40' : ''}`}
                      >
                        <td className="px-4 py-3 font-medium text-[#1e1e1e]">{row.name}</td>
                        <td className="px-4 py-3 font-mono text-xs">{row.sku || '—'}</td>
                        <td className="px-4 py-3">{row.categoryName}</td>
                        <td className="px-4 py-3 tabular-nums">{formatMoney(row.customPrice)}</td>
                        <td className="px-4 py-3 tabular-nums">{row.currentStock ?? '—'}</td>
                        <td className="px-4 py-3 tabular-nums">{row.reservedStock ?? '—'}</td>
                        <td className="px-4 py-3 tabular-nums font-medium">
                          {row.availableStock ?? '—'}
                          {low ? (
                            <span className="ml-1 text-[10px] uppercase text-amber-800">bajo</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <SyncStatusChip status={row.syncStatus} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {canAdj ? (
                            <Button size="sm" variant="ghost" onClick={() => setAdjustRow(row)}>
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

            <div className="grid gap-3 p-3 md:hidden" data-testid="inventory-mobile-list">
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
                    className={`rounded-md border p-3 ${low ? 'border-amber-300 bg-amber-50/50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-[#1e1e1e]">{row.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {row.sku || 'Sin SKU'} · {row.categoryName}
                        </p>
                      </div>
                      <SyncStatusChip status={row.syncStatus} />
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Actual</div>
                        <div className="tabular-nums font-medium">{row.currentStock ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Reserv.</div>
                        <div className="tabular-nums font-medium">{row.reservedStock ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Dispon.</div>
                        <div className="tabular-nums font-medium">{row.availableStock ?? '—'}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm tabular-nums">{formatMoney(row.customPrice)}</span>
                      {canAdj ? (
                        <Button size="sm" variant="outline" onClick={() => setAdjustRow(row)}>
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
