'use client';

import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import type { TenantScope } from '@/lib/offline/types';

/**
 * Indicador mínimo de conexión + sesión + outbox (P2-C0.2).
 * No implementa POS ni sync pull.
 */
export function SyncStatusBadge({ scope }: { scope: TenantScope | null }) {
  const { connection, session, pendingOps, canMutateOffline } = useOfflineStatus(scope);

  const connLabel = connection === 'online' ? 'En línea' : connection === 'offline' ? 'Sin red' : '…';
  const sessionLabel = canMutateOffline ? 'Sesión OK' : session.reason || 'Sesión bloqueada';

  return (
    <div
      className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
      data-testid="sync-status-badge"
      role="status"
      aria-live="polite"
    >
      <span data-testid="sync-connection">{connLabel}</span>
      <span aria-hidden>·</span>
      <span data-testid="sync-session">{sessionLabel}</span>
      {pendingOps > 0 ? (
        <>
          <span aria-hidden>·</span>
          <span data-testid="sync-pending">{pendingOps} pendiente(s)</span>
        </>
      ) : null}
    </div>
  );
}
