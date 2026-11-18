import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAuthUserSnapshot,
  getAuthUserSnapshot,
  removeAuthToken,
  setAuthUserSnapshot,
  setTokens,
} from '@/lib/auth-utils';
import {
  clearSessionExpirations,
  setSessionExpirations,
  getSessionGateState,
} from '@/lib/offline/sessionGate';
import { PWA_OPERATIONAL_ROUTES, PWA_SW_VERSION } from '@/lib/pwa/constants';
import { countBlockingOutbox } from '@/lib/pwa/updateGate';
import { createScope, deleteOfflineDbForTests, closeAllOfflineDbs } from '@/lib/offline';

describe('P2-C1.F2 PWA shell helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    clearSessionExpirations();
  });

  afterEach(async () => {
    removeAuthToken();
    clearAuthUserSnapshot();
    clearSessionExpirations();
    await closeAllOfflineDbs();
  });

  it('persiste snapshot de usuario sin JWT', () => {
    setAuthUserSnapshot({
      id: 1,
      username: 'admin_a',
      role: 'ADMIN',
      businessId: 1,
      name: 'Admin A',
    });
    const snap = getAuthUserSnapshot();
    expect(snap?.username).toBe('admin_a');
    expect(snap?.businessId).toBe(1);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('removeAuthToken limpia snapshot', () => {
    setTokens('aaa.bbb.ccc', 'refresh.token.value');
    setAuthUserSnapshot({
      id: 2,
      username: 'x',
      role: 'EMPLOYEE',
      businessId: 2,
    });
    removeAuthToken();
    expect(getAuthUserSnapshot()).toBeNull();
  });

  it('sesión vencida bloquea mutaciones', () => {
    setSessionExpirations({
      accessExpiresAt: Date.now() - 1000,
      refreshExpiresAt: Date.now() - 1000,
    });
    const gate = getSessionGateState();
    expect(gate.mutationsAllowed).toBe(false);
  });

  it('rutas operativas y versión SW definidas', () => {
    expect(PWA_SW_VERSION.startsWith('st-pwa-')).toBe(true);
    expect(PWA_OPERATIONAL_ROUTES).toContain('/ventas');
    expect(PWA_OPERATIONAL_ROUTES).toContain('/productos');
  });

  it('countBlockingOutbox sin scope = 0', async () => {
    expect(await countBlockingOutbox(null)).toBe(0);
  });

  it('countBlockingOutbox con DB vacía = 0', async () => {
    const scope = createScope(9, 9, 'pwa-test-device');
    await deleteOfflineDbForTests(scope);
    expect(await countBlockingOutbox(scope)).toBe(0);
  });
});
