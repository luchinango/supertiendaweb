import { PWA_SW_URL } from './constants';

export type SwRegistrationState =
  | { status: 'unsupported' }
  | { status: 'registered'; registration: ServiceWorkerRegistration }
  | { status: 'error'; error: string };

let pendingUpdate: ServiceWorkerRegistration | null = null;
const updateListeners = new Set<(ready: boolean) => void>();

export function getPendingSwUpdate(): ServiceWorkerRegistration | null {
  return pendingUpdate;
}

export function subscribeSwUpdate(listener: (ready: boolean) => void): () => void {
  updateListeners.add(listener);
  listener(!!pendingUpdate);
  return () => updateListeners.delete(listener);
}

function notifyUpdate(reg: ServiceWorkerRegistration | null) {
  pendingUpdate = reg;
  for (const l of updateListeners) l(!!reg);
}

export async function registerServiceWorker(): Promise<SwRegistrationState> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { status: 'unsupported' };
  }

  try {
    const registration = await navigator.serviceWorker.register(PWA_SW_URL, {
      scope: '/',
      updateViaCache: 'none',
    });

    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          notifyUpdate(registration);
        }
      });
    });

    // Si ya hay waiting al registrar
    if (registration.waiting && navigator.serviceWorker.controller) {
      notifyUpdate(registration);
    }

    return { status: 'registered', registration };
  } catch (e) {
    return {
      status: 'error',
      error: e instanceof Error ? e.message : 'SW register failed',
    };
  }
}

/** Activar waiting SW. Caller debe verificar outbox pendiente. */
export async function activateWaitingServiceWorker(): Promise<void> {
  const reg = pendingUpdate || (await navigator.serviceWorker.getRegistration());
  if (!reg?.waiting) return;
  reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  notifyUpdate(null);
  await new Promise<void>((resolve) => {
    const onController = () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onController);
      resolve();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onController);
    // timeout seguridad
    window.setTimeout(resolve, 4000);
  });
}

export function postToServiceWorker(message: Record<string, unknown>): void {
  const ctrl = navigator.serviceWorker?.controller;
  if (ctrl) ctrl.postMessage(message);
}

export async function clearShellCaches(): Promise<void> {
  postToServiceWorker({ type: 'CLEAR_SHELL_CACHES' });
}

export async function clearNavCache(): Promise<void> {
  postToServiceWorker({ type: 'CLEAR_NAV_CACHE' });
}
