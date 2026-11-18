import type { TenantScope } from './types';
import { OfflineStorageError } from './types';

function lockName(scope: TenantScope): string {
  return `supertienda-sync-u${scope.userId}-b${scope.businessId}-d${scope.deviceId}`;
}

/** Fallback in-memory (misma pestaña) + opcional navigator.locks (cross-tab). */
const memoryHeld = new Set<string>();

export type SyncLockHandle = {
  release: () => void | Promise<void>;
};

/**
 * Exclusión verificable por scope.
 * Prefer Web Locks API; si no hay, fallback memoria (no cross-tab real).
 * BroadcastChannel NO se usa como mutex.
 */
export async function acquireSyncLock(
  scope: TenantScope,
  opts?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<SyncLockHandle> {
  const name = lockName(scope);
  const timeoutMs = opts?.timeoutMs ?? 15_000;

  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    let releaseFn: (() => void) | null = null;
    const acquired = new Promise<SyncLockHandle>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new OfflineStorageError('Timeout adquiriendo sync lock', 'SYNC_LOCKED'));
      }, timeoutMs);

      void navigator.locks
        .request(name, { mode: 'exclusive', ifAvailable: false }, async (lock) => {
          if (!lock) {
            clearTimeout(timer);
            reject(new OfflineStorageError('Sync lock no disponible', 'SYNC_LOCKED'));
            return;
          }
          await new Promise<void>((releaseResolve) => {
            releaseFn = () => releaseResolve();
            clearTimeout(timer);
            resolve({
              release: async () => {
                releaseFn?.();
              },
            });
          });
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });

    if (opts?.signal?.aborted) {
      throw new OfflineStorageError('Sync lock abortado', 'SYNC_LOCKED');
    }
    return acquired;
  }

  // Fallback misma pestaña
  if (memoryHeld.has(name)) {
    throw new OfflineStorageError('Sync lock ocupado (fallback memoria)', 'SYNC_LOCKED');
  }
  memoryHeld.add(name);
  return {
    release: () => {
      memoryHeld.delete(name);
    },
  };
}

export function isMemoryLockHeldForTests(scope: TenantScope): boolean {
  return memoryHeld.has(lockName(scope));
}

export function resetMemoryLocksForTests(): void {
  memoryHeld.clear();
}

/**
 * Notifica a otras pestañas que el sync terminó (no es mutex).
 */
export function broadcastSyncEvent(
  scope: TenantScope,
  event: { type: 'sync-done' | 'outbox-changed'; detail?: unknown }
): void {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    const ch = new BroadcastChannel(lockName(scope));
    ch.postMessage({ ...event, at: Date.now() });
    ch.close();
  } catch {
    // ignore
  }
}

export function subscribeSyncEvents(
  scope: TenantScope,
  handler: (msg: { type: string; at?: number; detail?: unknown }) => void
): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => undefined;
  const ch = new BroadcastChannel(lockName(scope));
  const onMsg = (ev: MessageEvent) => {
    if (ev.data && typeof ev.data === 'object') handler(ev.data as { type: string });
  };
  ch.addEventListener('message', onMsg);
  return () => {
    ch.removeEventListener('message', onMsg);
    ch.close();
  };
}
