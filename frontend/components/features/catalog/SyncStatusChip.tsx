'use client';

import type { LocalEntitySyncStatus } from '@/lib/offline/types';

const STYLES: Record<LocalEntitySyncStatus, string> = {
  synced: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-50 text-amber-900 border-amber-200',
  conflict: 'bg-red-50 text-red-800 border-red-200',
  tombstone: 'bg-slate-100 text-slate-600 border-slate-200',
};

const LABELS: Record<LocalEntitySyncStatus, string> = {
  synced: 'Sincronizado',
  pending: 'Pendiente',
  conflict: 'Conflicto',
  tombstone: 'Eliminado',
};

export function SyncStatusChip({ status }: { status: LocalEntitySyncStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${STYLES[status]}`}
      data-testid={`sync-chip-${status}`}
    >
      {LABELS[status]}
    </span>
  );
}
