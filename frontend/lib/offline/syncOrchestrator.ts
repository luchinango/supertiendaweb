import { openOfflineDb } from './db';
import { getSessionGateState } from './sessionGate';
import { applyPullChanges } from './pullApplier';
import { pullAllPages, type PullTransport } from './syncPullClient';
import {
  createBrowserPushTransport,
  runPushCycle,
  type PushTransport,
} from './syncPushWorker';
import { createBrowserPullTransport } from './syncPullClient';
import { acquireSyncLock, broadcastSyncEvent } from './syncLock';
import type { CatalogSyncCycleResult, TenantScope } from './types';
import { OfflineStorageError } from './types';

export type SyncOrchestratorOptions = {
  scope: TenantScope;
  accessToken: string;
  tokenBusinessId: number;
  pushTransport?: PushTransport;
  pullTransport?: PullTransport;
  pullLimit?: number;
  /** Si true, solo pull (p.ej. primera descarga). Default false → push luego pull. */
  pullOnly?: boolean;
  /** Si true, solo push. */
  pushOnly?: boolean;
  apiBase?: string;
  now?: number;
};

/**
 * Orden **push → pull** (justificación):
 * 1) Empujar pendientes primero para obtener serverIds/version y detectar VERSION_CONFLICT
 *    contra el estado actual del servidor antes de materializar un snapshot.
 * 2) Pull después aplica el estado final del snapshot; no marca ops como acked
 *    (eso solo ocurre en applyPushResults tras respuesta persistida).
 * 3) Entidades locales pending/conflict no se sobrescriben en pull.
 *
 * Pull→push sería peor ante conflictos: el snapshot podría pisar proyecciones
 * locales si no hay protección, o retrasar el descubrimiento de VERSION_CONFLICT.
 */
export async function runCatalogSyncCycle(
  opts: SyncOrchestratorOptions
): Promise<CatalogSyncCycleResult> {
  const now = opts.now ?? Date.now();
  const result: CatalogSyncCycleResult = {
    pushed: 0,
    pullPages: 0,
    pullChanges: 0,
    snapshotAt: null,
    cursor: null,
    skippedLocalPending: 0,
    errors: [],
  };

  if (opts.tokenBusinessId !== opts.scope.businessId) {
    throw new OfflineStorageError(
      'JWT businessId no coincide con scope offline',
      'SCOPE_MISMATCH'
    );
  }

  const gate = getSessionGateState(now);
  if (gate.refreshExpiresAt != null && now >= gate.refreshExpiresAt) {
    throw new OfflineStorageError('Refresh vencido — sync pausado', 'SESSION_BLOCKED');
  }

  const lock = await acquireSyncLock(opts.scope);
  try {
    const pushTransport =
      opts.pushTransport || createBrowserPushTransport(opts.apiBase);
    const pullTransport =
      opts.pullTransport || createBrowserPullTransport(opts.apiBase);

    if (!opts.pullOnly) {
      try {
        const pushRes = await runPushCycle({
          scope: opts.scope,
          accessToken: opts.accessToken,
          tokenBusinessId: opts.tokenBusinessId,
          transport: pushTransport,
          now,
        });
        result.pushed = pushRes.sent;
      } catch (err: unknown) {
        if (err instanceof OfflineStorageError && err.code === 'SESSION_BLOCKED') {
          throw err;
        }
        // Red: registrar y continuar a pull si hay cursor (lectura aún útil)
        result.errors.push(err instanceof Error ? err.message : String(err));
      }
    }

    if (opts.pushOnly) {
      broadcastSyncEvent(opts.scope, { type: 'sync-done', detail: result });
      return result;
    }

    const db = await openOfflineDb(opts.scope);
    const saved = await db.syncState.get('catalog');
    // Reanudar paginación del mismo snapshot si quedó a medias (hasMore implícito vía cursor)
    let startCursor = '';
    if (saved?.cursor && saved.lastError === 'PULL_IN_PROGRESS') {
      startCursor = saved.cursor;
    }

    const { pages, last } = await pullAllPages({
      scope: opts.scope,
      accessToken: opts.accessToken,
      transport: pullTransport,
      startCursor: startCursor || undefined,
      limit: opts.pullLimit ?? 50,
      streams: 'catalog,stock',
      onPage: async (page) => {
        result.pullPages += 1;
        result.pullChanges += page.changes.length;
        const applied = await applyPullChanges(opts.scope, page.changes);
        result.skippedLocalPending += applied.skippedLocalPending;

        await db.syncState.put({
          stream: 'catalog',
          cursor: page.cursor,
          snapshotAt: page.snapshotAt,
          lastPullAt: new Date().toISOString(),
          lastError: page.hasMore ? 'PULL_IN_PROGRESS' : null,
          businessId: opts.scope.businessId,
        });
        result.snapshotAt = page.snapshotAt;
        result.cursor = page.cursor;
      },
    });

    if (!pages.length) {
      result.errors.push('pull_empty');
    } else if (last && !last.hasMore) {
      await db.syncState.put({
        stream: 'catalog',
        cursor: last.cursor,
        snapshotAt: last.snapshotAt,
        lastPullAt: new Date().toISOString(),
        lastError: null,
        businessId: opts.scope.businessId,
        lastPushAt: saved?.lastPushAt ?? null,
      });
    }

    broadcastSyncEvent(opts.scope, { type: 'sync-done', detail: result });
    return result;
  } finally {
    await lock.release();
  }
}

/** Reintentar ops recoverable (pending/rejected retryable) — nuevo intento, MISMO UUID. */
export async function retryRecoverableOutboxOp(
  scope: TenantScope,
  clientOperationId: string
): Promise<void> {
  const db = await openOfflineDb(scope);
  const row = await db.outbox.get(clientOperationId);
  if (!row) return;
  if (row.status === 'acked') return;
  // No reescribir payload; solo reencolar estado
  if (row.status === 'rejected' && row.lastErrorCode === 'SKU_COLLISION') {
    // Definitivo: no auto-retry silencioso; el caller UI debe crear NUEVA op con nuevo UUID
    throw new OfflineStorageError(
      'SKU_COLLISION requiere nueva operación con nuevo UUID y payload corregido',
      'NETWORK'
    );
  }
  if (row.status === 'conflict') {
    throw new OfflineStorageError(
      'VERSION_CONFLICT requiere acción explícita (nuevo UUID o baseVersion actualizado)',
      'NETWORK'
    );
  }
  await db.outbox.update(clientOperationId, {
    status: 'pending',
    nextAttemptAt: new Date().toISOString(),
    lastError: null,
  });
  broadcastSyncEvent(scope, { type: 'outbox-changed' });
}
