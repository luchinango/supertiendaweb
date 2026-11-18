'use client';

import { useCallback, useEffect, useState } from 'react';
import { listOutbox } from '@/lib/offline/outboxService';
import { retryRecoverableOutboxOp } from '@/lib/offline/syncOrchestrator';
import { subscribeSyncEvents } from '@/lib/offline/syncLock';
import type { OutboxOperation, TenantScope } from '@/lib/offline/types';

const STATUS_ORDER = ['pending', 'sending', 'conflict', 'rejected', 'dead', 'acked'] as const;

/**
 * UI mínima de revisión de outbox / conflictos (P2-C0.3).
 * No reescribe payloads rechazados con el mismo UUID.
 */
export function OutboxReviewPanel({ scope }: { scope: TenantScope | null }) {
  const [ops, setOps] = useState<OutboxOperation[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!scope) {
      setOps([]);
      return;
    }
    const all = await listOutbox(scope);
    setOps(all);
  }, [scope]);

  useEffect(() => {
    void reload();
    if (!scope) return;
    return subscribeSyncEvents(scope, () => {
      void reload();
    });
  }, [scope, reload]);

  const onRetry = async (op: OutboxOperation) => {
    if (!scope) return;
    setMsg(null);
    try {
      await retryRecoverableOutboxOp(scope, op.clientOperationId);
      setMsg(`Reencolada ${op.clientOperationId.slice(0, 8)}… (mismo UUID)`);
      await reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  if (!scope) return null;

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: ops.filter((o) => o.status === status),
  })).filter((g) => g.items.length > 0 || ['pending', 'conflict', 'rejected'].includes(g.status));

  return (
    <div className="space-y-4 rounded-md border bg-background p-4 text-sm" data-testid="outbox-review">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Cola offline / conflictos</h2>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() => void reload()}
        >
          Actualizar
        </button>
      </div>
      {msg ? <p className="text-xs text-amber-700">{msg}</p> : null}
      {grouped.map((g) => (
        <section key={g.status} data-testid={`outbox-group-${g.status}`}>
          <h3 className="mb-1 font-medium capitalize">
            {g.status} ({g.items.length})
          </h3>
          {g.items.length === 0 ? (
            <p className="text-xs text-muted-foreground">Ninguna</p>
          ) : (
            <ul className="space-y-2">
              {g.items.map((op) => (
                <li
                  key={op.clientOperationId}
                  className="rounded border p-2"
                  data-testid={`outbox-op-${op.status}`}
                >
                  <div className="font-mono text-xs">{op.clientOperationId}</div>
                  <div>
                    {op.operationType}
                    {op.localEntityType ? ` · ${op.localEntityType}` : ''}
                    {op.localEntityId ? ` · ${op.localEntityId.slice(0, 12)}` : ''}
                  </div>
                  {op.lastErrorCode || op.lastError ? (
                    <div className="text-xs text-red-700">
                      {op.lastErrorCode}: {op.lastError}
                    </div>
                  ) : null}
                  {op.status === 'pending' || op.status === 'dead' ? (
                    <button
                      type="button"
                      className="mt-1 rounded border px-2 py-0.5 text-xs"
                      onClick={() => void onRetry(op)}
                    >
                      Reintentar (mismo UUID)
                    </button>
                  ) : null}
                  {op.status === 'conflict' || op.status === 'rejected' ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Acción explícita requerida: no se reutiliza este UUID con otro payload.
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
