import { PWA_OPERATIONAL_ROUTES, PWA_MANIFEST_URL } from './constants';

function collectLoadedResourceUrls(): string[] {
  if (typeof performance === 'undefined') return [];
  const urls: string[] = [];
  for (const entry of performance.getEntriesByType('resource') as PerformanceResourceTiming[]) {
    try {
      const u = new URL(entry.name);
      if (u.origin !== window.location.origin) continue;
      if (u.pathname.startsWith('/api/')) continue;
      if (u.pathname.includes('/auth/')) continue;
      if (u.searchParams.has('_rsc')) continue;
      urls.push(u.href);
    } catch {
      // ignore
    }
  }
  return urls;
}

/**
 * Prepara caché de shell tras sesión online + sync + caja.
 * No toca IndexedDB ni API JSON.
 */
export async function warmPwaShellCache(extraRoutes: string[] = []): Promise<{
  warmed: number;
  controller: boolean;
}> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { warmed: 0, controller: false };
  }

  const reg = await navigator.serviceWorker.ready;
  const controller = !!navigator.serviceWorker.controller || !!reg.active;

  const routes = Array.from(
    new Set([...PWA_OPERATIONAL_ROUTES, ...extraRoutes, window.location.pathname])
  );

  // Precargar documentos operativos (network → SW cache via WARM o fetch)
  for (const path of routes) {
    try {
      await fetch(path, { credentials: 'same-origin', cache: 'reload' });
    } catch {
      // ignore
    }
  }

  const urls = Array.from(
    new Set([
      ...routes.map((p) => new URL(p, window.location.origin).href),
      new URL(PWA_MANIFEST_URL, window.location.origin).href,
      new URL('/offline.html', window.location.origin).href,
      new URL('/favicon.ico', window.location.origin).href,
      new URL('/icons/icon-192.png', window.location.origin).href,
      new URL('/icons/icon-512.png', window.location.origin).href,
      ...collectLoadedResourceUrls(),
    ])
  );

  await new Promise<void>((resolve) => {
    const sw = navigator.serviceWorker.controller || reg.active;
    if (!sw) {
      resolve();
      return;
    }
    const channel = new MessageChannel();
    const t = window.setTimeout(() => resolve(), 8000);
    channel.port1.onmessage = () => {
      window.clearTimeout(t);
      resolve();
    };
    sw.postMessage({ type: 'WARM_URLS', urls }, [channel.port2]);
  });

  return { warmed: urls.length, controller };
}
