/* SuperTienda PWA shell — P2-C1.F2
 * Cache Storage solo para shell/estáticos. Datos comerciales = IndexedDB (Dexie).
 * No cachear /api, JWT, cookies ni payloads de caja/ventas.
 */
const SW_VERSION = 'st-pwa-v2';
const PRECACHE = `${SW_VERSION}-precache`;
const STATIC_CACHE = `${SW_VERSION}-static`;
const NAV_CACHE = `${SW_VERSION}-nav`;

const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const OPERATIONAL_PATHS = ['/ventas', '/productos', '/inventario', '/dashboard'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      await cache.addAll(PRECACHE_URLS);
      // No skipWaiting automático: el cliente decide si hay outbox pendiente.
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('st-pwa-') && !k.startsWith(SW_VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

function isApiRequest(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('5000') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/sync/') ||
    url.pathname.startsWith('/cash-registers/') ||
    url.pathname.startsWith('/health')
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname.startsWith('/images/') ||
    /\.(?:js|css|woff2?|png|svg|ico|webp|avif)$/i.test(url.pathname)
  );
}

function isOperationalNav(url) {
  return OPERATIONAL_PATHS.some(
    (p) => url.pathname === p || url.pathname.startsWith(`${p}/`)
  );
}

function shouldBypassCache(request) {
  if (request.method !== 'GET') return true;
  const url = new URL(request.url);
  if (isApiRequest(url)) return true;
  // RSC / flight: no cachear respuestas dinámicas de router (pueden mezclar estado).
  // La navegación de documento sí se cachea para cold start.
  if (request.headers.get('RSC') === '1') return true;
  if (request.headers.get('Next-Router-State-Tree')) return true;
  if (url.searchParams.has('_rsc')) return true;
  return false;
}

async function networkOnly(request) {
  return fetch(request);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  // next dev añade ?v= a chunks; HTML pide sin query → ignoreSearch
  const hit =
    (await cache.match(request, { ignoreSearch: true })) ||
    (await cache.match(request, { ignoreSearch: false }));
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.type !== 'opaque') {
    const ct = res.headers.get('content-type') || '';
    // Nunca cachear JSON de API por error de path
    if (!ct.includes('application/json')) {
      await cache.put(request, res.clone());
    }
  }
  return res;
}

async function networkFirstNav(request) {
  const cache = await caches.open(NAV_CACHE);
  try {
    const res = await fetch(request);
    // Solo HTML 200 (nunca redirects de middleware/login ni errores)
    if (res.status === 200) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('text/html')) {
        await cache.put(request, res.clone());
      }
    }
    return res;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Intentar match por pathname sin query
    const url = new URL(request.url);
    const keys = await cache.keys();
    for (const key of keys) {
      const kUrl = new URL(key.url);
      if (kUrl.pathname === url.pathname) return (await cache.match(key)) || cached;
    }
    const offline = await caches.match('/offline.html');
    return (
      offline ||
      new Response('Offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    );
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // Cross-origin API (p.ej. :5000): network only, sin cache
    if (isApiRequest(url)) {
      event.respondWith(networkOnly(request));
    }
    return;
  }

  if (shouldBypassCache(request) || isApiRequest(url)) {
    event.respondWith(networkOnly(request));
    return;
  }

  if (request.mode === 'navigate' || request.destination === 'document') {
    if (isOperationalNav(url) || url.pathname === '/offline.html') {
      event.respondWith(networkFirstNav(request));
      return;
    }
    // Otras rutas: red, fallback offline genérico
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const offline = await caches.match('/offline.html');
          return (
            offline ||
            new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
          );
        }
      })()
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (data.type === 'CLEAR_NAV_CACHE') {
    event.waitUntil(caches.delete(NAV_CACHE).then(() => caches.open(NAV_CACHE)));
    return;
  }
  if (data.type === 'CLEAR_SHELL_CACHES') {
    event.waitUntil(
      (async () => {
        await caches.delete(NAV_CACHE);
        await caches.delete(STATIC_CACHE);
        // Conservar PRECACHE mínimo (offline.html / icons)
      })()
    );
    return;
  }
  if (data.type === 'WARM_URLS' && Array.isArray(data.urls)) {
    event.waitUntil(
      (async () => {
        const nav = await caches.open(NAV_CACHE);
        const st = await caches.open(STATIC_CACHE);
        for (const raw of data.urls) {
          try {
            const u = new URL(raw, self.location.origin);
            if (u.origin !== self.location.origin) continue;
            if (isApiRequest(u)) continue;
            if (u.searchParams.has('_rsc')) continue;
            const req = new Request(u.href, { credentials: 'same-origin' });
            const res = await fetch(req);
            if (res.status !== 200) continue;
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) continue;
            if (ct.includes('text/html') || isOperationalNav(u)) {
              await nav.put(req, res.clone());
            } else {
              await st.put(req, res.clone());
            }
          } catch {
            // ignore warm failures
          }
        }
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ ok: true });
        }
      })()
    );
  }
});
