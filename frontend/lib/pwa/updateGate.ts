import type { TenantScope } from '@/lib/offline/types';
import { countOutboxByStatus } from '@/lib/offline/outboxService';
import {
  activateWaitingServiceWorker,
  getPendingSwUpdate,
} from './registerServiceWorker';

export async function countBlockingOutbox(scope: TenantScope | null): Promise<number> {
  if (!scope) return 0;
  try {
    const counts = await countOutboxByStatus(scope);
    return (
      (counts['pending'] || 0) +
      (counts['sending'] || 0) +
      (counts['conflict'] || 0)
    );
  } catch {
    return 0;
  }
}

/**
 * Activa SW waiting solo si no hay operaciones bloqueantes,
 * o si el usuario fuerza (force=true) tras confirmar.
 * Nunca borra IndexedDB.
 */
export async function applyPwaUpdateSafely(opts: {
  scope: TenantScope | null;
  force?: boolean;
}): Promise<{ applied: boolean; reason?: string }> {
  if (!getPendingSwUpdate()) {
    return { applied: false, reason: 'NO_UPDATE' };
  }
  const blocking = await countBlockingOutbox(opts.scope);
  if (blocking > 0 && !opts.force) {
    return {
      applied: false,
      reason: `OUTBOX_PENDING:${blocking}`,
    };
  }
  await activateWaitingServiceWorker();
  // Recarga suave solo fuera de cobro — caller decide; aquí no forzamos reload.
  return { applied: true };
}
