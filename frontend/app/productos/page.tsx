'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, RefreshCw, Grid2X2, Share2, AlertCircle, ShoppingCart } from 'lucide-react';
import { useCommercialCatalog } from '@/hooks/useCommercialCatalog';
import { SyncStatusChip } from '@/components/features/catalog/SyncStatusChip';
import { StockStatusBadge } from '@/components/features/catalog/StockStatusBadge';
import {
  AdoptSharedDialog,
  CategoryManagerDialog,
  CreateProductDialog,
  EditProductDialog,
} from '@/components/features/catalog/CatalogProductDialogs';
import { OutboxReviewPanel } from '@/components/offline/OutboxReviewPanel';
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';
import type { CommercialCatalogRow } from '@/lib/catalog/commercialTypes';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@/lib/catalog/commercialTypes';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TableRowsSkeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

function formatMoney(n: number | null) {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CatalogPageInner() {
  const cat = useCommercialCatalog();
  const [createOpen, setCreateOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [adoptOpen, setAdoptOpen] = useState(false);
  const [editRow, setEditRow] = useState<CommercialCatalogRow | null>(null);
  const [showOutbox, setShowOutbox] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const threshold = DEFAULT_LOW_STOCK_THRESHOLD;

  const pendingCount = useMemo(
    () => cat.rows.filter((r) => r.syncStatus === 'pending' || r.syncStatus === 'conflict').length,
    [cat.rows]
  );

  if (!cat.canRead) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
        Inicia sesión con un usuario de empresa para ver el catálogo.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5" data-testid="commercial-catalog-page">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-[#1e1e1e] sm:text-2xl">
            Catálogo comercial
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Precios desde BusinessProduct · {cat.isAdmin ? 'ADMIN' : 'EMPLOYEE (solo lectura)'}
          </p>
          <div className="mt-2 hidden sm:block">
            <SyncStatusBadge scope={cat.scope} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void cat.syncNow()}
            disabled={cat.syncing}
            className="h-10 gap-2 lg:h-9"
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
            Cola {pendingCount ? `(${pendingCount})` : ''}
          </Button>
          {cat.isAdmin ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 lg:h-9"
                onClick={() => setCatsOpen(true)}
              >
                <Grid2X2 className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">Categorías</span>
                <span className="sm:hidden">Cats</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 lg:h-9"
                onClick={() => setAdoptOpen(true)}
              >
                <Share2 className="h-4 w-4" />
                Adoptar
              </Button>
              <Button
                size="sm"
                className="h-10 gap-2 bg-[#1e1e1e] hover:bg-[#2e2e2e] lg:h-9"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            </>
          ) : null}
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
          className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{cat.error}</span>
        </div>
      ) : null}

      <div className="sticky top-0 z-10 -mx-1 flex flex-col gap-3 rounded-md bg-[#F3F4F6]/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-[#F3F4F6]/90 sm:static sm:mx-0 sm:flex-row sm:items-center sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="catalog-search"
            placeholder="Buscar por nombre, SKU o categoría…"
            className="h-11 pl-9 sm:h-10"
            value={cat.search}
            onChange={(e) => cat.setSearch(e.target.value)}
            data-testid="catalog-search"
            aria-label="Buscar en catálogo"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Visibilidad</span>
          <select
            className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e1e1e] sm:h-10"
            value={cat.visibility}
            onChange={(e) => cat.setVisibility(e.target.value as typeof cat.visibility)}
            data-testid="catalog-visibility-filter"
            aria-label="Filtrar por visibilidad"
          >
            <option value="all">Todos</option>
            <option value="private">Privados</option>
            <option value="shared">Compartidos adoptados</option>
          </select>
        </label>
      </div>

      {showOutbox && cat.scope ? (
        <OutboxReviewPanel scope={cat.scope} />
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-white">
        {cat.loading ? (
          <div data-testid="catalog-loading">
            <TableRowsSkeleton rows={6} />
          </div>
        ) : cat.rows.length === 0 ? (
          <div className="space-y-3 p-8 text-center" data-testid="catalog-empty">
            <p className="text-sm text-muted-foreground">
              No hay productos comerciales.{' '}
              {cat.isAdmin
                ? 'Crea uno o sincroniza para descargar.'
                : 'Sincroniza para ver el catálogo.'}
            </p>
            <Button
              variant="outline"
              className="h-10"
              disabled={cat.syncing}
              onClick={() => void cat.syncNow()}
            >
              Sincronizar ahora
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm" data-testid="catalog-table">
                <thead className="border-b bg-[#f7f7f7] text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Precio</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Sync</th>
                    <th className="px-4 py-3 font-medium">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cat.rows.map((row) => {
                    const stock = row.availableStock ?? row.currentStock;
                    return (
                      <tr
                        key={row.productLocalId}
                        className="border-b last:border-0 transition-colors motion-reduce:transition-none hover:bg-slate-50/80 focus-within:bg-slate-50/80"
                      >
                        <td className="px-4 py-3 font-medium text-[#1e1e1e]">{row.name}</td>
                        <td className="px-4 py-3 font-mono text-xs">{row.sku || '—'}</td>
                        <td className="px-4 py-3">{row.categoryName}</td>
                        <td className="px-4 py-3 tabular-nums">{formatMoney(row.customPrice)}</td>
                        <td className="px-4 py-3 tabular-nums">{stock ?? '—'}</td>
                        <td className="px-4 py-3">
                          <StockStatusBadge available={stock} lowThreshold={threshold} />
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {row.isPrivate ? 'Privado' : 'Compartido'}
                        </td>
                        <td className="px-4 py-3">
                          <SyncStatusChip status={row.syncStatus} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {cat.isAdmin ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9"
                              onClick={() => setEditRow(row)}
                            >
                              Editar
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 lg:hidden" data-testid="catalog-mobile-list">
              {cat.rows.map((row) => {
                const stock = row.availableStock ?? row.currentStock;
                return (
                  <article
                    key={row.productLocalId}
                    className="rounded-md border bg-[#fafafa] p-3 transition-colors motion-reduce:transition-none focus-within:border-[#1e1e1e]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-[#1e1e1e]">{row.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {row.sku || 'Sin SKU'} · {row.categoryName}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <StockStatusBadge available={stock} lowThreshold={threshold} />
                        <SyncStatusChip status={row.syncStatus} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <div className="text-lg font-semibold tabular-nums text-[#1e1e1e]">
                          Bs {formatMoney(row.customPrice)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Stock {stock ?? '—'} · {row.isPrivate ? 'Privado' : 'Compartido'}
                        </div>
                      </div>
                      {cat.isAdmin ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-10 min-w-[5.5rem]"
                          onClick={() => setEditRow(row)}
                        >
                          Editar
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

      {process.env.NODE_ENV === 'development' || process.env['NEXT_PUBLIC_OFFLINE_DEBUG'] === '1' ? (
        <p className="text-xs text-muted-foreground">
          Harness técnico QA:{' '}
          <Link href="/debug-offline" className="underline">
            /debug-offline
          </Link>
        </p>
      ) : null}

      <CreateProductDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={cat.categories}
        onSubmit={async (v) => {
          await cat.createProduct(v);
          setFlash('Producto guardado localmente (pending). No confirmado en servidor aún.');
        }}
      />
      <EditProductDialog
        open={!!editRow}
        row={editRow}
        categories={cat.categories}
        onClose={() => setEditRow(null)}
        onSubmit={async (v) => {
          if (!editRow) return;
          if (!editRow.productServerId) {
            await cat.revisePending({
              productLocalId: editRow.productLocalId,
              name: v.name,
              sku: v.sku,
              categoryServerId: v.categoryServerId,
              customPrice: v.customPrice,
            });
            setFlash('Creación pendiente corregida (mismo UUID). Aún no confirmada en servidor.');
            return;
          }
          await cat.editProduct({
            productLocalId: editRow.productLocalId,
            productServerId: editRow.productServerId,
            baseVersion: editRow.productVersion,
            name: v.name,
            sku: v.sku,
            categoryServerId: v.categoryServerId,
          });
          if (editRow.bpVersion != null && v.customPrice !== editRow.customPrice) {
            await cat.setPrice({
              productServerId: editRow.productServerId,
              customPrice: v.customPrice,
              baseVersion: editRow.bpVersion,
              bpLocalId: editRow.bpLocalId || undefined,
            });
          }
          setFlash('Cambios encolados (pending). No confirmados en servidor aún.');
        }}
        onPrice={async (customPrice) => {
          if (!editRow?.productServerId || editRow.bpVersion == null) {
            throw new Error('Sin BusinessProduct versionado — sincroniza o adopta primero');
          }
          await cat.setPrice({
            productServerId: editRow.productServerId,
            customPrice,
            baseVersion: editRow.bpVersion,
            bpLocalId: editRow.bpLocalId || undefined,
          });
          setFlash('Precio encolado (pending).');
        }}
      />
      <AdoptSharedDialog
        open={adoptOpen}
        items={cat.adoptable}
        onClose={() => setAdoptOpen(false)}
        onSubmit={async (v) => {
          await cat.adopt(v);
          setFlash('Adopción encolada (pending).');
        }}
      />
      <CategoryManagerDialog
        open={catsOpen}
        categories={cat.categories}
        onClose={() => setCatsOpen(false)}
        onCreate={async (name) => {
          await cat.createCategory({ name });
          setFlash('Categoría privada encolada.');
        }}
        onUpdate={async (c) => {
          if (!c.serverId) return;
          await cat.editCategory({
            categoryLocalId: c.localId,
            categoryServerId: c.serverId,
            baseVersion: cat.categories.find((x) => x.localId === c.localId)?.version ?? 1,
            name: c.name,
          });
        }}
      />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <ProtectedRoute>
      <CatalogPageInner />
    </ProtectedRoute>
  );
}
