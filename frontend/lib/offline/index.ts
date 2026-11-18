/**
 * Infraestructura offline-first IndexedDB + outbox + catalog sync (P2-C0.2 / P2-C0.3).
 * No SSR. No passwords/refresh tokens en IDB.
 */

export * from './types';
export * from './scope';
export * from './db';
export * from './sessionGate';
export * from './outboxService';
export * from './syncPushWorker';
export * from './syncPullClient';
export * from './pullApplier';
export * from './syncLock';
export * from './syncOrchestrator';
export * from './connectivity';
