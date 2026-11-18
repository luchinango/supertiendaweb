import type { SessionGateState } from './types';
import { OfflineStorageError } from './types';

/**
 * Política de vigencia del refresh (P2-C0 / P2-C0.1):
 * si el refresh ya expiró, se bloquean nuevas mutaciones offline.
 * Los tokens NO se guardan en IndexedDB — solo epoch de expiración en memoria/localStorage meta.
 */

const REFRESH_EXP_KEY = 'supertienda_refresh_exp';
const ACCESS_EXP_KEY = 'supertienda_access_exp';

let memory: SessionGateState = {
  refreshExpiresAt: null,
  accessExpiresAt: null,
  mutationsAllowed: true,
};

function readStoredExp(key: string): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function setSessionExpirations(opts: {
  accessExpiresAt?: number | null;
  refreshExpiresAt?: number | null;
}): void {
  if (typeof window === 'undefined') return;
  if (opts.accessExpiresAt != null) {
    localStorage.setItem(ACCESS_EXP_KEY, String(opts.accessExpiresAt));
    memory.accessExpiresAt = opts.accessExpiresAt;
  }
  if (opts.refreshExpiresAt != null) {
    localStorage.setItem(REFRESH_EXP_KEY, String(opts.refreshExpiresAt));
    memory.refreshExpiresAt = opts.refreshExpiresAt;
  }
  memory = getSessionGateState();
}

export function clearSessionExpirations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFRESH_EXP_KEY);
  localStorage.removeItem(ACCESS_EXP_KEY);
  memory = {
    refreshExpiresAt: null,
    accessExpiresAt: null,
    mutationsAllowed: false,
    reason: 'Sesión cerrada',
  };
}

export function getSessionGateState(now = Date.now()): SessionGateState {
  const refreshExpiresAt = memory.refreshExpiresAt ?? readStoredExp(REFRESH_EXP_KEY);
  const accessExpiresAt = memory.accessExpiresAt ?? readStoredExp(ACCESS_EXP_KEY);

  if (refreshExpiresAt == null) {
    // Sin metadatos de refresh: permitir mutaciones locales pero el push exigirá JWT válido.
    memory = {
      refreshExpiresAt,
      accessExpiresAt,
      mutationsAllowed: true,
      reason: undefined,
    };
    return memory;
  }

  if (now >= refreshExpiresAt) {
    memory = {
      refreshExpiresAt,
      accessExpiresAt,
      mutationsAllowed: false,
      reason: 'Refresh token vencido — nuevas mutaciones offline bloqueadas',
    };
    return memory;
  }

  memory = {
    refreshExpiresAt,
    accessExpiresAt,
    mutationsAllowed: true,
  };
  return memory;
}

export function assertMutationsAllowed(): void {
  const state = getSessionGateState();
  if (!state.mutationsAllowed) {
    throw new OfflineStorageError(
      state.reason || 'Mutaciones offline bloqueadas por sesión',
      'SESSION_BLOCKED'
    );
  }
}

/** Decodifica payload JWT sin verificar firma (solo meta local / arranque offline). */
export function readJwtPayload(
  token: string | null | undefined
): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

/** Decodifica exp de un JWT sin verificar firma (solo para gate local). */
export function readJwtExpMs(token: string | null | undefined): number | null {
  const json = readJwtPayload(token);
  if (!json || typeof json['exp'] !== 'number') return null;
  return (json['exp'] as number) * 1000;
}
