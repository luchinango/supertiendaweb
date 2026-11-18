'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OutboxReviewPanel } from '@/components/offline/OutboxReviewPanel';
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';
import {
  createScope,
  enqueueMutation,
  getOrCreateDeviceId,
  newUuid,
  openOfflineDb,
  runCatalogSyncCycle,
} from '@/lib/offline';
import { getAuthToken, getBusinessId } from '@/lib/auth-utils';

/**
 * Harness local P2-C0.3 — no es el módulo comercial visual.
 * Permite ejercitar create offline + sync push/pull contra Docker.
 */
export default function DebugOfflinePage() {
  const { user } = useAuth();
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const scope = useMemo(() => {
    if (!user?.id || user.businessId == null) return null;
    try {
      return createScope(Number(user.id), Number(user.businessId), getOrCreateDeviceId());
    } catch {
      return null;
    }
  }, [user?.id, user?.businessId]);

  const append = (line: string) => setLog((prev) => [line, ...prev].slice(0, 40));

  const runSync = async () => {
    if (!scope) return;
    const token = getAuthToken();
    const bid = getBusinessId();
    if (!token || bid == null) {
      append('Sin token/businessId');
      return;
    }
    setBusy(true);
    try {
      const res = await runCatalogSyncCycle({
        scope,
        accessToken: token,
        tokenBusinessId: bid,
        apiBase: process.env['NEXT_PUBLIC_API_URL'] || 'http://127.0.0.1:5000',
      });
      append(
        `Sync OK push=${res.pushed} pages=${res.pullPages} changes=${res.pullChanges} skipPending=${res.skippedLocalPending}`
      );
      if (res.errors.length) append(`Warn: ${res.errors.join('; ')}`);
    } catch (e: unknown) {
      append(`Sync fail: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const enqueueSample = async () => {
    if (!scope) return;
    setBusy(true);
    try {
      const localId = newUuid();
      const opId = newUuid();
      await enqueueMutation(scope, {
        clientOperationId: opId,
        operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
        localEntityId: localId,
        localEntityType: 'product',
        payload: {
          name: `Offline harness ${opId.slice(0, 6)}`,
          categoryServerId: 1,
          customPrice: 11.5,
          sku: `OFF-${opId.slice(0, 8)}`,
          localEntityId: localId,
          localBusinessProductId: `${localId}-bp`,
        },
        localProduct: {
          localId,
          serverId: null,
          payload: { name: `Offline harness ${opId.slice(0, 6)}` },
          version: 0,
          deleted: false,
        },
      });
      append(`Encolado ${opId}`);
    } catch (e: unknown) {
      append(`Enqueue fail: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const countLocal = async () => {
    if (!scope) return;
    const db = await openOfflineDb(scope);
    const [p, c, bp, o] = await Promise.all([
      db.products.count(),
      db.categories.count(),
      db.businessProducts.count(),
      db.outbox.count(),
    ]);
    append(`Local products=${p} categories=${c} bp=${bp} outbox=${o}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-xl font-semibold">Debug offline catálogo</h1>
      <p className="text-sm text-muted-foreground">
        Harness de prueba P2-C0.3. Requiere sesión ADMIN empresarial y backend Docker.
      </p>
      <SyncStatusBadge scope={scope} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !scope}
          className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          onClick={() => void enqueueSample()}
        >
          Crear producto offline
        </button>
        <button
          type="button"
          disabled={busy || !scope}
          className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          onClick={() => void runSync()}
        >
          Sync push+pull
        </button>
        <button
          type="button"
          disabled={!scope}
          className="rounded border px-3 py-1.5 text-sm"
          onClick={() => void countLocal()}
        >
          Contar IndexedDB
        </button>
      </div>
      <OutboxReviewPanel scope={scope} />
      <pre className="max-h-64 overflow-auto rounded border bg-muted/30 p-2 text-xs">
        {log.join('\n') || 'Sin eventos'}
      </pre>
    </div>
  );
}
