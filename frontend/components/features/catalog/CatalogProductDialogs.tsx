'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CommercialCatalogRow } from '@/lib/catalog/commercialTypes';

type CatOption = {
  localId: string;
  serverId: number | null;
  name: string;
  isPrivate: boolean;
};

export function CreateProductDialog({
  open,
  onClose,
  categories,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  categories: CatOption[];
  onSubmit: (v: {
    name: string;
    categoryServerId?: number;
    categoryLocalId?: string;
    customPrice: number;
    sku?: string;
    initialStock?: number;
  }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('0');
  /** Prefijo s: serverId | l: localId */
  const [categoryKey, setCategoryKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setSku('');
      setPrice('');
      setStock('0');
      setErr(null);
      const first =
        categories.find((c) => c.serverId != null) || categories.find((c) => c.isPrivate);
      if (first?.serverId != null) setCategoryKey(`s:${first.serverId}`);
      else if (first) setCategoryKey(`l:${first.localId}`);
      else setCategoryKey('');
    }
  }, [open, categories]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-[#1e1e1e]">Nuevo producto privado</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Se guarda localmente y se sincroniza cuando haya red. Precio = customPrice comercial.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              setBusy(true);
              setErr(null);
              try {
                if (!categoryKey) throw new Error('Selecciona una categoría');
                const payload: {
                  name: string;
                  categoryServerId?: number;
                  categoryLocalId?: string;
                  customPrice: number;
                  sku?: string;
                  initialStock?: number;
                } = {
                  name,
                  customPrice: Number(price),
                  sku: sku || undefined,
                  initialStock: Number(stock) || 0,
                };
                if (categoryKey.startsWith('s:')) {
                  payload.categoryServerId = Number(categoryKey.slice(2));
                } else if (categoryKey.startsWith('l:')) {
                  payload.categoryLocalId = categoryKey.slice(2);
                } else {
                  throw new Error('Categoría inválida');
                }
                await onSubmit(payload);
                onClose();
              } catch (ex: unknown) {
                setErr(ex instanceof Error ? ex.message : String(ex));
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          <div>
            <Label htmlFor="np-name">Nombre</Label>
            <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="np-sku">SKU (opcional)</Label>
            <Input id="np-sku" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="np-cat">Categoría</Label>
            <select
              id="np-cat"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
              required
            >
              <option value="">Seleccionar…</option>
              {categories.map((c) => (
                <option
                  key={c.localId}
                  value={c.serverId != null ? `s:${c.serverId}` : `l:${c.localId}`}
                >
                  {c.name}
                  {c.isPrivate ? ' (privada)' : ''}
                  {!c.serverId ? ' · pendiente' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Categorías pendientes se envían tras sync (dependsOn + resolución de serverId).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="np-price">Precio comercial</Label>
              <Input
                id="np-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="np-stock">Stock inicial</Label>
              <Input
                id="np-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
          {err ? <p className="text-sm text-red-700">{err}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy} className="bg-[#1e1e1e] hover:bg-[#2e2e2e]">
              {busy ? 'Guardando…' : 'Crear offline'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditProductDialog({
  open,
  row,
  categories,
  onClose,
  onSubmit,
  onPrice,
}: {
  open: boolean;
  row: CommercialCatalogRow | null;
  categories: CatOption[];
  onClose: () => void;
  onSubmit: (v: {
    name: string;
    sku: string | null;
    categoryServerId?: number;
    customPrice: number;
  }) => Promise<void>;
  onPrice: (customPrice: number) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [categoryServerId, setCategoryServerId] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (row && open) {
      setName(row.name);
      setSku(row.sku || '');
      setPrice(row.customPrice != null ? String(row.customPrice) : '');
      setCategoryServerId(row.categoryId ?? '');
      setErr(null);
    }
  }, [row, open]);

  if (!open || !row) return null;
  const canEditMasterFields = row.isPrivate;
  const isPendingCreate = row.isPrivate && row.productServerId == null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-[#1e1e1e]">
          {row.isPrivate ? 'Editar producto privado' : 'Precio comercial (compartido)'}
        </h2>
        {isPendingCreate ? (
          <p className="mt-1 text-xs text-amber-800">
            Creación pendiente: se corrige el mismo UUID de outbox (aún no confirmado en servidor).
          </p>
        ) : null}
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              setBusy(true);
              setErr(null);
              try {
                if (canEditMasterFields) {
                  await onSubmit({
                    name,
                    sku: sku || null,
                    categoryServerId: categoryServerId === '' ? undefined : Number(categoryServerId),
                    customPrice: Number(price),
                  });
                } else {
                  await onPrice(Number(price));
                }
                onClose();
              } catch (ex: unknown) {
                setErr(ex instanceof Error ? ex.message : String(ex));
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          {canEditMasterFields ? (
            <>
              <div>
                <Label htmlFor="ep-name">Nombre</Label>
                <Input id="ep-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="ep-sku">SKU</Label>
                <Input id="ep-sku" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ep-cat">Categoría</Label>
                <select
                  id="ep-cat"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={categoryServerId}
                  onChange={(e) => setCategoryServerId(e.target.value ? Number(e.target.value) : '')}
                >
                  {categories
                    .filter((c) => c.serverId != null)
                    .map((c) => (
                      <option key={c.localId} value={c.serverId!}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Producto de plataforma: solo puedes actualizar el precio comercial de tu empresa.
            </p>
          )}
          <div>
            <Label htmlFor="ep-price">Precio comercial (customPrice)</Label>
            <Input
              id="ep-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          {err ? <p className="text-sm text-red-700">{err}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy} className="bg-[#1e1e1e] hover:bg-[#2e2e2e]">
              {busy ? 'Guardando…' : 'Guardar offline'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdoptSharedDialog({
  open,
  items,
  onClose,
  onSubmit,
}: {
  open: boolean;
  items: { serverId: number; name: string; sku: string | null }[];
  onClose: () => void;
  onSubmit: (v: { productServerId: number; customPrice: number }) => Promise<void>;
}) {
  const [productServerId, setProductServerId] = useState<number | ''>('');
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProductServerId(items[0]?.serverId ?? '');
      setPrice('');
      setErr(null);
    }
  }, [open, items]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold">Adoptar producto compartido</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Crea un BusinessProduct con tu precio. No modifica el catálogo maestro.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              setBusy(true);
              setErr(null);
              try {
                if (productServerId === '') throw new Error('Selecciona un producto');
                await onSubmit({ productServerId: Number(productServerId), customPrice: Number(price) });
                onClose();
              } catch (ex: unknown) {
                setErr(ex instanceof Error ? ex.message : String(ex));
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          <div>
            <Label htmlFor="ad-prod">Producto plataforma</Label>
            <select
              id="ad-prod"
              className="flex h-10 w-full rounded-md border px-3 text-sm"
              value={productServerId}
              onChange={(e) => setProductServerId(e.target.value ? Number(e.target.value) : '')}
            >
              {items.length === 0 ? <option value="">No hay candidatos (sincroniza primero)</option> : null}
              {items.map((i) => (
                <option key={i.serverId} value={i.serverId}>
                  {i.name}
                  {i.sku ? ` · ${i.sku}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="ad-price">Tu precio comercial</Label>
            <Input
              id="ad-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          {err ? <p className="text-sm text-red-700">{err}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy || items.length === 0} className="bg-[#1e1e1e] hover:bg-[#2e2e2e]">
              Adoptar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CategoryManagerDialog({
  open,
  categories,
  onClose,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  categories: CatOption[];
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  onUpdate: (c: CatOption & { name: string }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;
  const privates = categories.filter((c) => c.isPrivate);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold">Categorías privadas</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              setBusy(true);
              setErr(null);
              try {
                await onCreate(name);
                setName('');
              } catch (ex: unknown) {
                setErr(ex instanceof Error ? ex.message : String(ex));
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          <Input
            placeholder="Nueva categoría privada"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit" disabled={busy} className="bg-[#1e1e1e] hover:bg-[#2e2e2e]">
            Crear
          </Button>
        </form>
        {err ? <p className="mt-2 text-sm text-red-700">{err}</p> : null}
        <ul className="mt-4 max-h-64 space-y-2 overflow-auto">
          {privates.length === 0 ? (
            <li className="text-sm text-muted-foreground">Sin categorías privadas aún</li>
          ) : (
            privates.map((c) => (
              <li key={c.localId} className="flex items-center justify-between gap-2 rounded border px-3 py-2 text-sm">
                <span>
                  {c.name}
                  {!c.serverId ? ' · pendiente' : ''}
                </span>
                {c.serverId ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const next = window.prompt('Nuevo nombre', c.name);
                      if (!next) return;
                      void onUpdate({ ...c, name: next });
                    }}
                  >
                    Renombrar
                  </Button>
                ) : null}
              </li>
            ))
          )}
        </ul>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
