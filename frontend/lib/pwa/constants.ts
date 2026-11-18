/** Versión de shell PWA — alinear con public/sw.js SW_VERSION al cambiar. */
export const PWA_SW_VERSION = 'st-pwa-v2';
export const PWA_SW_URL = '/sw.js';
export const PWA_MANIFEST_URL = '/manifest.webmanifest';

export const PWA_OPERATIONAL_ROUTES = [
  '/ventas',
  '/productos',
  '/inventario',
  '/dashboard',
] as const;
