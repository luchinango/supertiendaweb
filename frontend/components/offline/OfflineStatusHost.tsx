'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createScope, getOrCreateDeviceId } from '@/lib/offline/scope';
import { SyncStatusBadge } from './SyncStatusBadge';
import Link from 'next/link';

/** Montaje cliente del badge de sync — no toca IndexedDB en SSR. */
export function OfflineStatusHost() {
  const { user } = useAuth();

  const scope = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (!user?.id || user.businessId == null) return null;
    try {
      return createScope(Number(user.id), Number(user.businessId), getOrCreateDeviceId());
    } catch {
      return null;
    }
  }, [user?.id, user?.businessId]);

  if (!scope) return null;

  return (
    <div className="fixed bottom-3 right-3 z-40 flex flex-col items-end gap-1 rounded-md border bg-background/95 px-3 py-2 shadow-sm">
      <SyncStatusBadge scope={scope} />
      <Link href="/debug-offline" className="text-[10px] underline opacity-70">
        Revisar cola offline
      </Link>
    </div>
  );
}
