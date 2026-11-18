export type ConnectionStatus = 'online' | 'offline' | 'unknown';

let listeners = new Set<(s: ConnectionStatus) => void>();

export function getConnectionStatus(): ConnectionStatus {
  if (typeof navigator === 'undefined') return 'unknown';
  return navigator.onLine ? 'online' : 'offline';
}

function emit(status: ConnectionStatus) {
  for (const l of listeners) l(status);
}

export function subscribeConnection(listener: (s: ConnectionStatus) => void): () => void {
  listeners.add(listener);
  if (typeof window !== 'undefined') {
    const onOnline = () => {
      // No asumir backend vivo solo por navigator.onLine
      void probeApiHealth().then((ok) => {
        emit(ok ? 'online' : 'offline');
      });
    };
    const onOffline = () => emit('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }
  return () => {
    listeners.delete(listener);
  };
}

/** Ping liviano — conectividad real con backend. No sustituye outbox. */
export async function probeApiHealth(apiBase?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const base =
    apiBase ||
    (typeof process !== 'undefined' && process.env['NEXT_PUBLIC_API_URL']) ||
    '';
  if (!base) return false;
  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`${base}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: ctrl.signal,
    });
    window.clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}
