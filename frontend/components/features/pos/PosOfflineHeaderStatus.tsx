'use client';

import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';
import { OPEN_DAY_CONTROL_EVENT } from '@/components/offline/OfflineStatusHost';
import type { TenantScope } from '@/lib/offline/types';

/** Estado offline integrado en el encabezado POS — solo presentación / navegación. */
export function PosOfflineHeaderStatus({ scope }: { scope: TenantScope | null }) {
  const openJornada = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(OPEN_DAY_CONTROL_EVENT));
    window.history.replaceState(null, '', '/ventas#jornada');
    document.getElementById('pos-day-control')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5"
      data-testid="pos-offline-header"
    >
      <SyncStatusBadge scope={scope} />
      <button
        type="button"
        className="text-[11px] font-medium text-[#1e1e1e] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e1e1e]"
        data-testid="offline-queue-cashier-link"
        onClick={openJornada}
      >
        Jornada / cola
      </button>
    </div>
  );
}
