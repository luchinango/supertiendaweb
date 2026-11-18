'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createScope, getOrCreateDeviceId } from '@/lib/offline/scope';
import { registerServiceWorker, subscribeSwUpdate } from '@/lib/pwa/registerServiceWorker';
import { applyPwaUpdateSafely } from '@/lib/pwa/updateGate';

/**
 * Registra SW y muestra banner de actualización segura (no borra IndexedDB).
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [updateReady, setUpdateReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const scope = useMemo(() => {
    if (!user?.id || user.businessId == null) return null;
    try {
      return createScope(Number(user.id), Number(user.businessId), getOrCreateDeviceId());
    } catch {
      return null;
    }
  }, [user?.id, user?.businessId]);

  useEffect(() => {
    void registerServiceWorker();
    return subscribeSwUpdate(setUpdateReady);
  }, []);

  const onApplyUpdate = async (force: boolean) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await applyPwaUpdateSafely({ scope, force });
      if (!res.applied && res.reason?.startsWith('OUTBOX_PENDING')) {
        setMsg(
          'Hay ventas u operaciones pendientes. Sincronizá primero o forzá la actualización (riesgo de shell nueva con cola vieja).'
        );
        return;
      }
      if (res.applied) {
        window.location.reload();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {children}
      {updateReady ? (
        <div className="fixed bottom-16 left-3 z-50 max-w-sm rounded-md border border-teal-700/30 bg-white p-3 shadow-lg text-sm">
          <p className="font-medium text-teal-900">Nueva versión de SuperTienda</p>
          <p className="mt-1 text-xs text-gray-600">
            IndexedDB y ventas pendientes se conservan. No se activa si hay cola sin sincronizar.
          </p>
          {msg ? <p className="mt-1 text-xs text-amber-700">{msg}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              className="rounded bg-teal-700 px-2 py-1 text-xs text-white disabled:opacity-50"
              onClick={() => void onApplyUpdate(false)}
            >
              Actualizar shell
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded border px-2 py-1 text-xs text-gray-700 disabled:opacity-50"
              onClick={() => void onApplyUpdate(true)}
            >
              Forzar
            </button>
            <button
              type="button"
              className="rounded px-2 py-1 text-xs text-gray-500"
              onClick={() => setUpdateReady(false)}
            >
              Después
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
