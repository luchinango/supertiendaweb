'use client';

import { useEffect, useState } from 'react';
import {
  getConnectionStatus,
  subscribeConnection,
  type ConnectionStatus,
} from '@/lib/offline/connectivity';
import { getSessionGateState } from '@/lib/offline/sessionGate';
import { countOutboxByStatus } from '@/lib/offline/outboxService';
import type { SessionGateState, TenantScope } from '@/lib/offline/types';

export function useOfflineStatus(scope: TenantScope | null) {
  const [connection, setConnection] = useState<ConnectionStatus>('unknown');
  const [session, setSession] = useState<SessionGateState>(() => getSessionGateState());
  const [outboxCounts, setOutboxCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setConnection(getConnectionStatus());
    return subscribeConnection(setConnection);
  }, []);

  useEffect(() => {
    const tick = () => setSession(getSessionGateState());
    tick();
    const id = window.setInterval(tick, 5000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!scope) return;
    let cancelled = false;
    const load = async () => {
      try {
        const counts = await countOutboxByStatus(scope);
        if (!cancelled) setOutboxCounts(counts);
      } catch {
        if (!cancelled) setOutboxCounts({});
      }
    };
    void load();
    const id = window.setInterval(load, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [scope]);

  const pending =
    (outboxCounts['pending'] || 0) +
    (outboxCounts['sending'] || 0) +
    (outboxCounts['conflict'] || 0) +
    (outboxCounts['rejected'] || 0);

  return {
    connection,
    session,
    outboxCounts,
    pendingOps: pending,
    canMutateOffline: session.mutationsAllowed,
  };
}

// re-export type for consumers
export type { SessionGateState };
