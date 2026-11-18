/**
 * Cash Lease — autorización offline firmada por servidor (P2-C1.F1).
 * Sin migración: claims derivados de la caja OPEN (openingDate + TTL fijo).
 * GET open NO extiende expiresAt (misma emisión desde openingDate).
 */
import { createHmac, timingSafeEqual } from 'crypto';

export const CASH_LEASE_TTL_MS = 8 * 60 * 60 * 1000;
/** Holgura de reloj al verificar en servidor */
export const CASH_LEASE_SKEW_MS = 60_000;

export type CashLeaseClaims = {
  v: 1;
  leaseId: string;
  businessId: number;
  userId: number;
  deviceId: string;
  cashRegisterId: number;
  issuedAt: string;
  expiresAt: string;
};

export type CashLeaseBundle = CashLeaseClaims & {
  token: string;
};

export type CashLeaseVerifyResult =
  | { ok: true; claims: CashLeaseClaims }
  | { ok: false; code: string; message: string };

function b64url(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'utf8');
  return b
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64');
}

function leaseSecret(): string {
  const secret =
    process.env.CASH_LEASE_SECRET ||
    process.env.JWT_SECRET ||
    process.env.SYNC_HMAC_SECRET ||
    '';
  if (!secret || secret.length < 16) {
    // Dev Docker: secreto estable no-producción (nunca usar en prod sin env).
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CASH_LEASE_SECRET (o JWT_SECRET) requerido en producción');
    }
    return 'supertienda-dev-cash-lease-secret-do-not-use-in-prod';
  }
  return secret;
}

function canonicalPayload(claims: CashLeaseClaims): string {
  // Orden fijo — no JSON.stringify libre.
  return [
    `v=${claims.v}`,
    `leaseId=${claims.leaseId}`,
    `businessId=${claims.businessId}`,
    `userId=${claims.userId}`,
    `deviceId=${claims.deviceId}`,
    `cashRegisterId=${claims.cashRegisterId}`,
    `issuedAt=${claims.issuedAt}`,
    `expiresAt=${claims.expiresAt}`,
  ].join('|');
}

function signClaims(claims: CashLeaseClaims): string {
  const body = b64url(JSON.stringify(claims));
  const sig = createHmac('sha256', leaseSecret())
    .update(canonicalPayload(claims))
    .digest();
  return `${body}.${b64url(sig)}`;
}

export function buildLeaseId(cashRegisterId: number, issuedAtIso: string): string {
  const ms = Date.parse(issuedAtIso);
  return `cl_${cashRegisterId}_${Number.isFinite(ms) ? ms : issuedAtIso}`;
}

export function issueCashLease(input: {
  businessId: number;
  userId: number;
  deviceId: string;
  cashRegisterId: number;
  /** Fecha de apertura real de caja — base fija de expiresAt (no “ahora”). */
  openingDate: Date | string;
  now?: Date;
}): CashLeaseBundle {
  const opening =
    input.openingDate instanceof Date
      ? input.openingDate
      : new Date(input.openingDate);
  if (Number.isNaN(opening.getTime())) {
    throw new Error('openingDate inválida para cash lease');
  }
  const issuedAt = opening.toISOString();
  const expiresAt = new Date(opening.getTime() + CASH_LEASE_TTL_MS).toISOString();
  const claims: CashLeaseClaims = {
    v: 1,
    leaseId: buildLeaseId(input.cashRegisterId, issuedAt),
    businessId: input.businessId,
    userId: input.userId,
    deviceId: input.deviceId,
    cashRegisterId: input.cashRegisterId,
    issuedAt,
    expiresAt,
  };
  return { ...claims, token: signClaims(claims) };
}

export function verifyCashLeaseToken(
  token: string,
  expected: {
    businessId: number;
    userId: number;
    deviceId: string;
    cashRegisterId: number;
  },
  now = Date.now()
): CashLeaseVerifyResult {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { ok: false, code: 'LEASE_INVALID', message: 'Token de lease ausente o malformado' };
  }
  const [body, sig] = token.split('.');
  if (!body || !sig) {
    return { ok: false, code: 'LEASE_INVALID', message: 'Token de lease malformado' };
  }

  let claims: CashLeaseClaims;
  try {
    claims = JSON.parse(fromB64url(body).toString('utf8')) as CashLeaseClaims;
  } catch {
    return { ok: false, code: 'LEASE_INVALID', message: 'Claims de lease no parseables' };
  }

  if (claims.v !== 1 || !claims.leaseId || !claims.issuedAt || !claims.expiresAt) {
    return { ok: false, code: 'LEASE_INVALID', message: 'Claims de lease incompletos' };
  }

  const expectedSig = createHmac('sha256', leaseSecret())
    .update(canonicalPayload(claims))
    .digest();
  let providedSig: Buffer;
  try {
    providedSig = fromB64url(sig);
  } catch {
    return { ok: false, code: 'LEASE_TAMPERED', message: 'Firma de lease ilegible' };
  }
  if (
    expectedSig.length !== providedSig.length ||
    !timingSafeEqual(expectedSig, providedSig)
  ) {
    return { ok: false, code: 'LEASE_TAMPERED', message: 'Firma de lease inválida' };
  }

  if (claims.businessId !== expected.businessId) {
    return { ok: false, code: 'LEASE_SCOPE', message: 'Lease no corresponde a la empresa' };
  }
  if (claims.userId !== expected.userId) {
    return { ok: false, code: 'LEASE_SCOPE', message: 'Lease no corresponde al usuario' };
  }
  if (claims.deviceId !== expected.deviceId) {
    return { ok: false, code: 'LEASE_SCOPE', message: 'Lease no corresponde al dispositivo' };
  }
  if (claims.cashRegisterId !== expected.cashRegisterId) {
    return { ok: false, code: 'LEASE_SCOPE', message: 'Lease no corresponde a la caja' };
  }

  const exp = Date.parse(claims.expiresAt);
  if (!Number.isFinite(exp)) {
    return { ok: false, code: 'LEASE_INVALID', message: 'expiresAt inválido' };
  }
  if (now > exp + CASH_LEASE_SKEW_MS) {
    return { ok: false, code: 'LEASE_EXPIRED', message: 'Lease de caja vencido' };
  }

  return { ok: true, claims };
}

/** Vista pública (sin secretos) para API / sync server payload. */
export function publicLeaseFields(bundle: CashLeaseBundle) {
  return {
    leaseId: bundle.leaseId,
    leaseIssuedAt: bundle.issuedAt,
    leaseExpiresAt: bundle.expiresAt,
    cashLeaseToken: bundle.token,
  };
}
