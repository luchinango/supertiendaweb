import { openOfflineDb, type SuperTiendaOfflineDb } from './db';
import { applyPushResults, listOutbox, markSending, recoverOrphanSending } from './outboxService';
import { getSessionGateState } from './sessionGate';
import type { OutboxOperation, SyncPushResponse, TenantScope } from './types';
import { OfflineStorageError } from './types';

/** Campos solo-cliente: no se envían al servidor (hash local puede incluirlos antes de strip). */
function stripLocalOnlyPayloadFields(payload: Record<string, unknown>): Record<string, unknown> {
  const next = { ...payload };
  delete next['categoryLocalId'];
  delete next['reason'];
  return next;
}

/**
 * Resuelve categoryLocalId → categoryServerId vía idMap tras CATEGORY_PRIVATE_CREATE acked.
 * Persiste el payload resuelto (sin reescribir si ya tiene categoryServerId).
 */
async function resolveOutboundPayload(
  db: SuperTiendaOfflineDb,
  op: OutboxOperation
): Promise<OutboxOperation> {
  if (op.operationType !== 'PRODUCT_PRIVATE_CREATE_WITH_BP') return op;
  const catServer = op.payload['categoryServerId'];
  if (typeof catServer === 'number' && Number.isFinite(catServer)) return op;

  const catLocal = op.payload['categoryLocalId'];
  if (typeof catLocal !== 'string' || !catLocal) {
    throw new OfflineStorageError(
      'PRODUCT_PRIVATE_CREATE_WITH_BP sin categoryServerId ni categoryLocalId resoluble',
      'VALIDATION'
    );
  }

  const map = await db.idMap.get(`category:${catLocal}`);
  if (!map?.serverId) {
    // Deps deberían haber bloqueado; no inventar ID.
    throw new OfflineStorageError(
      `categoryLocalId ${catLocal} aún sin serverId en idMap`,
      'DEPENDENCY_UNRESOLVED'
    );
  }

  const nextPayload = {
    ...op.payload,
    categoryServerId: map.serverId,
  };
  await db.outbox.update(op.clientOperationId, { payload: nextPayload });

  const productLocalId =
    typeof op.payload['localEntityId'] === 'string' ? op.payload['localEntityId'] : op.localEntityId;
  if (productLocalId) {
    const p = await db.products.get(productLocalId);
    if (p) {
      await db.products.put({
        ...p,
        payload: {
          ...p.payload,
          categoryId: map.serverId,
          categoryLocalId: catLocal,
        },
      });
    }
  }

  return { ...op, payload: nextPayload };
}

const MAX_BATCH = 50;
const locks = new Map<string, boolean>();

export type PushTransport = (args: {
  scope: TenantScope;
  accessToken: string;
  body: {
    businessId: number;
    operations: {
      clientOperationId: string;
      operationType: string;
      baseVersion?: number | null;
      dependsOn?: string[];
      payload: Record<string, unknown>;
    }[];
  };
}) => Promise<SyncPushResponse>;

function scopeKey(scope: TenantScope): string {
  return `${scope.userId}:${scope.businessId}:${scope.deviceId}`;
}

function depsSatisfied(
  dependsOn: string[],
  acked: Set<string>
): boolean {
  return dependsOn.every((d) => acked.has(d));
}

/**
 * Worker de push: un solo envío concurrente por cola (scope).
 * Conserva UUID; no borra rejected/conflict; no confía en reloj cliente como autoridad server.
 */
export async function runPushCycle(opts: {
  scope: TenantScope;
  accessToken: string;
  /** JWT businessId claim — debe coincidir con scope */
  tokenBusinessId: number;
  transport: PushTransport;
  now?: number;
}): Promise<{ sent: number; results: SyncPushResponse['results'] }> {
  const { scope, accessToken, tokenBusinessId, transport } = opts;
  const now = opts.now ?? Date.now();

  if (tokenBusinessId !== scope.businessId) {
    throw new OfflineStorageError(
      'JWT businessId no coincide con scope offline — sync abortado',
      'SCOPE_MISMATCH'
    );
  }

  const gate = getSessionGateState(now);
  if (!gate.mutationsAllowed && gate.refreshExpiresAt != null && now >= gate.refreshExpiresAt) {
    // Push de ops ya encoladas: se permite intentar si hay access token;
    // pero documentamos que política de NUEVAS mutaciones está bloqueada.
    // Si refresh venció, no enviamos (evitar sync con sesión inválida).
    throw new OfflineStorageError(
      'Sesión refresh vencida — push pausado',
      'SESSION_BLOCKED'
    );
  }

  const key = scopeKey(scope);
  if (locks.get(key)) {
    return { sent: 0, results: [] };
  }
  locks.set(key, true);

  try {
    await recoverOrphanSending(scope);
    const db = await openOfflineDb(scope);
    const pending = (await listOutbox(scope, ['pending'])).filter(
      (o) => new Date(o.nextAttemptAt).getTime() <= now
    );
    const acked = new Set(
      (await listOutbox(scope, ['acked'])).map((o) => o.clientOperationId)
    );

    const batch: OutboxOperation[] = [];
    for (const op of pending) {
      if (batch.length >= MAX_BATCH) break;
      if (!depsSatisfied(op.dependsOn, acked)) continue;
      batch.push(op);
      // Dentro del mismo batch, permitir que applied posteriores vean deps del batch
      // solo tras respuesta; por ahora deps deben estar acked previos.
    }

    if (batch.length === 0) {
      return { sent: 0, results: [] };
    }

    // Hidratar refs locales → serverId (p.ej. categoryLocalId) ANTES del primer envío;
    // se persiste en outbox para no romper el hash de idempotencia en reintentos.
    const resolvedBatch: OutboxOperation[] = [];
    for (const op of batch) {
      try {
        resolvedBatch.push(await resolveOutboundPayload(db, op));
      } catch (e: unknown) {
        const code = e instanceof OfflineStorageError ? e.code : null;
        if (code === 'DEPENDENCY_UNRESOLVED' || code === 'VALIDATION') {
          // Dejar en pending; no enviar IDs temporales.
          continue;
        }
        throw e;
      }
    }

    if (resolvedBatch.length === 0) {
      return { sent: 0, results: [] };
    }

    await markSending(
      db,
      resolvedBatch.map((b) => b.clientOperationId)
    );

    let response: SyncPushResponse;
    try {
      response = await transport({
        scope,
        accessToken,
        body: {
          businessId: scope.businessId,
          operations: resolvedBatch.map((op) => ({
            clientOperationId: op.clientOperationId,
            operationType: op.operationType,
            baseVersion: op.baseVersion,
            dependsOn: op.dependsOn.length ? op.dependsOn : undefined,
            payload: stripLocalOnlyPayloadFields(op.payload),
          })),
        },
      });
    } catch (err: unknown) {
      // Pérdida de red / timeout: volver a pending con mismo UUID
      const msg = err instanceof Error ? err.message : 'network_error';
      await db.transaction('rw', db.outbox, db.sales, async () => {
        for (const op of batch) {
          await db.outbox.update(op.clientOperationId, {
            status: 'pending',
            lastError: msg,
            lastErrorCode: 'NETWORK',
            nextAttemptAt: new Date(now + 3000).toISOString(),
          });
          if (op.operationType === 'SALE_CREATE' && op.localEntityId) {
            const sale = await db.sales.get(op.localEntityId);
            if (sale) {
              await db.sales.put({
                ...sale,
                syncStatus: 'pending',
                lastError: msg,
                lastErrorCode: 'NETWORK',
              });
            }
          }
        }
      });
      throw err;
    }

    await applyPushResults(db, response.results || []);
    await db.syncState.put({
      stream: 'push',
      cursor: response.serverTime || '',
      lastPushAt: new Date().toISOString(),
      lastError: null,
      businessId: scope.businessId,
    });

    return { sent: batch.length, results: response.results || [] };
  } finally {
    locks.set(key, false);
  }
}

/** Transport HTTP real hacia POST /sync/push */
export function createBrowserPushTransport(apiBase?: string): PushTransport {
  const base =
    apiBase ||
    (typeof process !== 'undefined' && process.env['NEXT_PUBLIC_API_URL']) ||
    '';

  return async ({ scope, accessToken, body }) => {
    const url = `${base}/sync/push`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-Device-Id': scope.deviceId,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`push_http_${res.status}:${text.slice(0, 200)}`);
      }
      return (await res.json()) as SyncPushResponse;
    } finally {
      clearTimeout(timer);
    }
  };
}

export function isPushLocked(scope: TenantScope): boolean {
  return locks.get(scopeKey(scope)) === true;
}

/** Tests: libera locks. */
export function resetPushLocksForTests(): void {
  locks.clear();
}
