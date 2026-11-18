'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardList, RefreshCw, AlertTriangle } from 'lucide-react';
import { getAuthToken } from '@/lib/auth-utils';
import type { TenantScope } from '@/lib/offline/types';
import type { LocalSale } from '@/lib/offline/types';
import {
  fetchCashSession,
  type CashSessionSummary,
  PosOnlineError,
} from '@/lib/pos/posOnlineService';
import {
  listPendingLocalSales,
  listProblemLocalSales,
} from '@/lib/pos/posSaleOfflineService';

function moneyLabel(v: string | null | undefined): string {
  if (v == null || v === '') return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dtLabel(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-BO');
  } catch {
    return '—';
  }
}

function statusBadge(status: string) {
  const open = status === 'OPEN';
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        open
          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
          : 'border-slate-300 bg-slate-100 text-slate-800'
      }`}
    >
      {open ? 'Caja abierta' : 'Caja cerrada'}
    </span>
  );
}

function problemLabel(s: LocalSale): string {
  if (s.syncStatus === 'rejected') return 'Rechazada';
  if (s.syncStatus === 'conflict') return 'Conflicto';
  if (s.syncStatus === 'dead') return 'Agotada';
  return s.syncStatus;
}

function SessionSummaryBlock({
  session,
  compact,
}: {
  session: CashSessionSummary;
  compact?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className={`grid gap-3 sm:grid-cols-2 ${compact ? '' : 'lg:grid-cols-3'}`}>
        <div className="rounded-md border bg-[#fafafa] p-2 text-xs">
          <p className="text-muted-foreground">Caja / responsable</p>
          <p className="font-medium text-[#1e1e1e]">
            {session.cash.registerNumber}
            {session.cash.username ? ` · ${session.cash.username}` : ''}
          </p>
        </div>
        <div className="rounded-md border bg-[#fafafa] p-2 text-xs">
          <p className="text-muted-foreground">Apertura</p>
          <p className="font-medium tabular-nums">{dtLabel(session.cash.openingDate)}</p>
        </div>
        <div className="rounded-md border bg-[#fafafa] p-2 text-xs">
          <p className="text-muted-foreground">Cierre</p>
          <p className="font-medium tabular-nums">{dtLabel(session.cash.closingDate)}</p>
        </div>
        <div className="rounded-md border bg-[#fafafa] p-2 text-xs">
          <p className="text-muted-foreground">Saldo inicial</p>
          <p className="font-medium tabular-nums">{moneyLabel(session.cash.openingAmount)}</p>
        </div>
        <div className="rounded-md border bg-[#fafafa] p-2 text-xs">
          <p className="text-muted-foreground">Ventas efectivo (SALE_CASH)</p>
          <p className="font-medium tabular-nums">
            {moneyLabel(session.totals.saleCashTotal)} · {session.totals.confirmedSalesCount} venta(s)
          </p>
        </div>
        <div className="rounded-md border bg-[#fafafa] p-2 text-xs">
          <p className="text-muted-foreground">Otros movimientos</p>
          <p className="font-medium tabular-nums">
            In {moneyLabel(session.totals.cashInTotal)} · Out {moneyLabel(session.totals.cashOutTotal)}
          </p>
        </div>
        <div className="rounded-md border border-emerald-100 bg-emerald-50/50 p-2 text-xs">
          <p className="text-muted-foreground">Efectivo esperado (sistema)</p>
          <p className="font-semibold tabular-nums text-emerald-950">
            {moneyLabel(session.totals.expectedAmount)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Por movimientos: {moneyLabel(session.totals.expectedFromMovements)}
          </p>
        </div>
        <div className="rounded-md border bg-[#fafafa] p-2 text-xs">
          <p className="text-muted-foreground">Efectivo contado</p>
          <p className="font-medium tabular-nums">{moneyLabel(session.totals.countedAmount)}</p>
        </div>
        <div className="rounded-md border bg-[#fafafa] p-2 text-xs">
          <p className="text-muted-foreground">Diferencia</p>
          <p className="font-medium tabular-nums">{moneyLabel(session.totals.difference)}</p>
        </div>
      </div>

      {!compact && session.confirmedSales.length > 0 ? (
        <div className="rounded-md border p-2">
          <p className="mb-2 text-xs font-medium text-[#1e1e1e]">Ventas confirmadas de esta caja</p>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">
            {session.confirmedSales.map((s) => (
              <li key={s.id} className="flex justify-between gap-2 tabular-nums">
                <span className="font-medium text-emerald-900">
                  {s.commercialNumber || `Venta #${s.id}`}
                </span>
                <span>{moneyLabel(s.totalAmount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!compact && session.movements.length > 0 ? (
        <div className="rounded-md border p-2">
          <p className="mb-2 text-xs font-medium text-[#1e1e1e]">
            Movimientos ({session.totals.movementCount})
          </p>
          <ul className="max-h-36 space-y-1 overflow-y-auto text-[11px] text-muted-foreground">
            {session.movements.map((m) => (
              <li key={m.id} className="flex justify-between gap-2">
                <span>
                  {m.movementType}
                  {m.commercialNumber ? ` · ${m.commercialNumber}` : ''}
                </span>
                <span className="tabular-nums">{moneyLabel(m.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {compact ? (
        <p className="text-[11px] text-muted-foreground">
          {session.totals.confirmedSalesCount} venta(s) · {session.totals.movementCount} movimiento(s)
          · contado {moneyLabel(session.totals.countedAmount)}
        </p>
      ) : null}
    </div>
  );
}

export function PosDayControlPanel({
  scope,
  connection,
  onSyncPending,
  syncBusy,
}: {
  scope: TenantScope | null;
  connection: 'online' | 'offline' | string;
  onSyncPending?: (sale: LocalSale) => void;
  syncBusy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<CashSessionSummary | null>(null);
  const [previousClosed, setPreviousClosed] = useState<CashSessionSummary | null>(null);
  const [pending, setPending] = useState<LocalSale[]>([]);
  const [problems, setProblems] = useState<LocalSale[]>([]);

  const reload = useCallback(async () => {
    if (!scope) return;
    setLoading(true);
    setError(null);
    try {
      const [pend, probs] = await Promise.all([
        listPendingLocalSales(scope),
        listProblemLocalSales(scope),
      ]);
      setPending(pend);
      setProblems(probs);

      if (connection === 'online') {
        const token = getAuthToken();
        if (!token) {
          setSession(null);
          setPreviousClosed(null);
          setError('Inicia sesión para ver la conciliación del servidor.');
        } else {
          try {
            const env = await fetchCashSession(scope, token);
            setSession(env.session);
            setPreviousClosed(env.previousClosed ?? null);
          } catch (e) {
            setSession(null);
            setPreviousClosed(null);
            const msg =
              e instanceof PosOnlineError
                ? e.message
                : e instanceof Error
                  ? e.message
                  : 'No se pudo cargar la jornada';
            setError(msg);
          }
        }
      } else {
        setSession(null);
        setPreviousClosed(null);
      }
    } finally {
      setLoading(false);
    }
  }, [scope, connection]);

  useEffect(() => {
    if (!open || !scope) return;
    void reload();
  }, [open, scope, reload]);

  return (
    <section className="rounded-lg border bg-white" data-testid="pos-day-control">
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <ClipboardList className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-[#1e1e1e]">Control de jornada</p>
            <p className="text-xs text-muted-foreground">
              Conciliación de caja (servidor) y operaciones locales pendientes o rechazadas.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {open ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={loading || !scope}
              onClick={() => void reload()}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          ) : null}
          <Button
            size="sm"
            variant={open ? 'outline' : 'default'}
            className={!open ? 'bg-[#1e1e1e] hover:bg-[#2e2e2e]' : ''}
            data-testid="pos-day-control-toggle"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Ocultar' : 'Ver jornada'}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="space-y-4 border-t px-3 py-3">
          {error ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              {error}
            </div>
          ) : null}

          {/* Servidor */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Datos confirmados (servidor)
              </p>
              {session ? statusBadge(session.cash.status) : null}
              {connection !== 'online' ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-900">
                  Sin red — conciliación servidor no disponible
                </span>
              ) : null}
            </div>

            {!session && connection === 'online' && !loading ? (
              <p className="text-xs text-muted-foreground">
                No hay caja OPEN ni cerrada reciente para este dispositivo.
              </p>
            ) : null}

            {session ? <SessionSummaryBlock session={session} /> : null}

            {previousClosed ? (
              <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50/80 p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-slate-700">
                    Jornada anterior (cerrada) — no suma a la caja abierta actual
                  </p>
                  {statusBadge(previousClosed.cash.status)}
                </div>
                <SessionSummaryBlock session={previousClosed} compact />
              </div>
            ) : null}
          </div>

          {/* Locales */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Datos provisionales / locales (este dispositivo)
            </p>
            <p className="text-[11px] text-muted-foreground">
              Las ventas pendientes no suman dos veces a la caja del servidor. Solo cuentan cuando se
              confirman.
            </p>

            {pending.length === 0 && problems.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin operaciones locales pendientes ni rechazadas.</p>
            ) : null}

            {pending.length > 0 ? (
              <div
                className="space-y-2 rounded-md border border-amber-200 bg-amber-50/60 p-2"
                data-testid="pos-day-pending"
              >
                <p className="text-xs font-medium text-amber-950">
                  Pendientes de sincronización ({pending.length})
                </p>
                {pending.map((s) => (
                  <div
                    key={s.clientOperationId}
                    className="flex flex-col gap-2 rounded border border-amber-100 bg-white p-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-xs text-muted-foreground">
                      LOCAL-{s.localId.slice(0, 8).toUpperCase()} · provisional{' '}
                      {moneyLabel(String(s.provisionalTotal))} · {s.syncStatus}
                    </p>
                    {onSyncPending ? (
                      <Button
                        size="sm"
                        className="bg-[#1e1e1e] hover:bg-[#2e2e2e]"
                        disabled={syncBusy || connection !== 'online'}
                        onClick={() => onSyncPending(s)}
                      >
                        Sincronizar
                      </Button>
                    ) : null}
                  </div>
                ))}
                {session?.cash.status === 'OPEN' && pending.length > 0 ? (
                  <p className="flex gap-1 text-[11px] text-amber-950">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    No cierres la caja hasta sincronizar o resolver estas ventas.
                  </p>
                ) : null}
              </div>
            ) : null}

            {problems.length > 0 ? (
              <div
                className="space-y-2 rounded-md border border-red-200 bg-red-50/50 p-2"
                data-testid="pos-day-rejected"
              >
                <p className="text-xs font-medium text-red-950">
                  Rechazadas / conflicto ({problems.length})
                </p>
                {problems.map((s) => (
                  <div key={s.clientOperationId} className="rounded border border-red-100 bg-white p-2 text-xs">
                    <p className="font-medium text-red-900">
                      LOCAL-{s.localId.slice(0, 8).toUpperCase()} · {problemLabel(s)}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      {s.lastErrorCode ? `${s.lastErrorCode}: ` : ''}
                      {s.lastError || 'Sin detalle del servidor'}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      No se reintenta sola. Revisa el motivo; no genera cobro duplicado.
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
