import type { TenantScope } from './types';
import { OfflineStorageError } from './types';

const DEVICE_KEY = 'supertienda_device_id';

function assertBrowser(): void {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    throw new OfflineStorageError(
      'IndexedDB solo disponible en el navegador (no SSR)',
      'SSR_FORBIDDEN'
    );
  }
}

/** UUID v4 simple sin dependencia externa. */
export function newUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * deviceId estable por navegador/perfil (localStorage, no es secreto).
 * No se guarda en IndexedDB como token.
 */
export function getOrCreateDeviceId(): string {
  assertBrowser();
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id || id.length < 8) {
    id = newUuid();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id.slice(0, 64);
}

export function buildDbName(scope: TenantScope): string {
  return `supertienda_offline__u${scope.userId}__b${scope.businessId}__d${scope.deviceId}`;
}

export function createScope(userId: number, businessId: number, deviceId?: string): TenantScope {
  if (!userId || !businessId) {
    throw new OfflineStorageError('userId y businessId son obligatorios para el scope offline', 'SCOPE_MISMATCH');
  }
  return {
    userId,
    businessId,
    deviceId: deviceId || getOrCreateDeviceId(),
  };
}

export function assertSameScope(expected: TenantScope, actual: TenantScope): void {
  if (
    expected.userId !== actual.userId ||
    expected.businessId !== actual.businessId ||
    expected.deviceId !== actual.deviceId
  ) {
    throw new OfflineStorageError(
      'Scope offline no coincide (empresa/usuario/dispositivo)',
      'SCOPE_MISMATCH'
    );
  }
}

export { assertBrowser };
