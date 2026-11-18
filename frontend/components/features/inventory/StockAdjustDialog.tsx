'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CommercialCatalogRow } from '@/lib/catalog/commercialTypes';

export function StockAdjustDialog({
  open,
  row,
  onClose,
  onSubmit,
}: {
  open: boolean;
  row: CommercialCatalogRow | null;
  onClose: () => void;
  onSubmit: (v: { delta: number; reason: string }) => Promise<void>;
}) {
  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDirection('in');
      setQty('');
      setReason('');
      setConfirm(false);
      setErr(null);
    }
  }, [open, row?.bpLocalId]);

  const delta = useMemo(() => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return direction === 'in' ? n : -n;
  }, [qty, direction]);

  const preview = useMemo(() => {
    if (!row) return null;
    const current = row.currentStock ?? 0;
    const next = current + delta;
    return { current, next, ok: next >= 0 && delta !== 0 };
  }, [row, delta]);

  if (!open || !row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-[#1e1e1e]">Ajustar stock</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {row.name} · stock actual {row.currentStock ?? '—'} · disponible {row.availableStock ?? '—'}
        </p>
        <p className="mt-1 text-[11px] text-amber-800">
          Cambio local pendiente hasta confirmación del servidor. No se crea InventoryTransaction local.
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              setBusy(true);
              setErr(null);
              try {
                if (!preview?.ok) throw new Error('Cantidad inválida o stock resultante negativo');
                if (reason.trim().length < 2) throw new Error('Motivo obligatorio');
                if (!confirm) throw new Error('Confirma el ajuste antes de guardar');
                await onSubmit({ delta, reason: reason.trim() });
                onClose();
              } catch (ex: unknown) {
                setErr(ex instanceof Error ? ex.message : String(ex));
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          <div className="flex gap-2">
            <Button
              type="button"
              variant={direction === 'in' ? 'default' : 'outline'}
              className={direction === 'in' ? 'bg-[#1e1e1e] hover:bg-[#2e2e2e]' : ''}
              onClick={() => setDirection('in')}
            >
              Entrada
            </Button>
            <Button
              type="button"
              variant={direction === 'out' ? 'default' : 'outline'}
              className={direction === 'out' ? 'bg-[#1e1e1e] hover:bg-[#2e2e2e]' : ''}
              onClick={() => setDirection('out')}
            >
              Salida
            </Button>
          </div>
          <div>
            <Label htmlFor="adj-qty">Cantidad (positiva)</Label>
            <Input
              id="adj-qty"
              type="number"
              min="1"
              step="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="adj-reason">Motivo</Label>
            <Input
              id="adj-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. conteo físico / merma operativa"
              required
            />
          </div>
          {preview ? (
            <p className="text-sm tabular-nums text-muted-foreground">
              {preview.current} → <span className="font-medium text-[#1e1e1e]">{preview.next}</span>
              {preview.next < 0 ? ' (negativo no permitido)' : ''}
            </p>
          ) : null}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
            />
            <span>Confirmo el ajuste STOCK_ADJUST (se encola con UUID estable y baseVersion del BP).</span>
          </label>
          {err ? <p className="text-sm text-red-700">{err}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy} className="bg-[#1e1e1e] hover:bg-[#2e2e2e]">
              {busy ? 'Guardando…' : 'Encolar ajuste'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
