'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createScope, getOrCreateDeviceId } from '@/lib/offline/scope';
import { SyncStatusBadge } from './SyncStatusBadge';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/** Evento POS: abrir bandeja operativa (no harness de debug). */
export const OPEN_DAY_CONTROL_EVENT = 'supertienda:open-day-control';

function openCashierOfflineQueue(router: ReturnType<typeof useRouter>, pathname: string | null) {
  if (typeof window === 'undefined') return;
  if (pathname === '/ventas') {
    window.dispatchEvent(new CustomEvent(OPEN_DAY_CONTROL_EVENT));
    window.history.replaceState(null, '', '/ventas#jornada');
    document.getElementById('pos-day-control')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  router.push('/ventas#jornada');
}

/** Montaje cliente del badge de sync — no toca IndexedDB en SSR. */
export function OfflineStatusHost() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const scope = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (!user?.id || user.businessId == null) return null;
    try {
      return createScope(Number(user.id), Number(user.businessId), getOrCreateDeviceId());
    } catch {
      return null;
    }
  }, [user?.id, user?.businessId]);

  const showTechDebug =
    process.env.NODE_ENV === 'development' || process.env['NEXT_PUBLIC_OFFLINE_DEBUG'] === '1';

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/login/') ||
    pathname?.startsWith('/register/');

  if (!scope || isAuthRoute) return null;

  /** En /ventas el estado vive en el encabezado POS (G9.4) — evita solape con caja/sticky. */
  const onVentas = pathname === '/ventas' || pathname?.startsWith('/ventas/');
  if (onVentas) return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-30 flex max-w-[min(220px,45vw)] flex-col items-end gap-0.5 rounded-md border border-slate-200/80 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm"
      data-testid="offline-status-host"
    >
      <SyncStatusBadge scope={scope} />
      <button
        type="button"
        className="text-left text-[10px] leading-tight underline opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1e1e1e]"
        data-testid="offline-queue-cashier-link"
        onClick={() => openCashierOfflineQueue(router, pathname)}
      >
        Cola offline
      </button>
      {showTechDebug ? (
        <Link
          href="/debug-offline"
          className="text-[10px] underline opacity-50 hover:opacity-80"
          data-testid="offline-queue-debug-link"
        >
          Debug técnico
        </Link>
      ) : null}
    </div>
  );
}
