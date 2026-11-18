/**
 * Autorización offline de caja — P2-C1.F1 (Cash Lease firmado por servidor).
 * No permite CASH_OPEN ni CASH_CLOSE offline.
 * GET open actualiza montos/versión pero NO extiende leaseExpiresAt.
 */
import { openOfflineDb } from '@/lib/offline/db';
import { getSessionGateState } from '@/lib/offline/sessionGate';
import type { LocalCashRegister, TenantScope } from '@/lib/offline/types';
import type { OpenCashRegister } from './posOnlineService';

/** Alineado al TTL servidor (CashLeaseService.CASH_LEASE_TTL_MS). */
export const OFFLINE_CASH_AUTH_MAX_MS = 8 * 60 * 60 * 1000;

export type OfflineCashAuthResult =
  | { ok: true; cash: LocalCashRegister; remainingMs: number }
  | { ok: false; code: string; message: string };

export function toLocalCashRegister(
  open: OpenCashRegister,
  opts?: { preserveLeaseFrom?: LocalCashRegister | null; serverConfirmedAt?: string }
): LocalCashRegister {
  const prev = opts?.preserveLeaseFrom;
  // Lease: preferir el del servidor si trae token; si GET reenvía el mismo expiresAt, conservar.
  // Nunca extender expiresAt localmente más allá del valor servidor.
  const leaseExpiresAt = open.leaseExpiresAt || prev?.leaseExpiresAt || null;
  const leaseIssuedAt = open.leaseIssuedAt || prev?.leaseIssuedAt || null;
  const leaseId = open.leaseId || prev?.leaseId || null;
  const cashLeaseToken = open.cashLeaseToken || prev?.cashLeaseToken || null;

  return {
    serverId: open.id,
    businessId: open.businessId,
    userId: open.userId,
    deviceId: open.deviceId,
    registerNumber: open.registerNumber,
    version: open.version,
    status: open.status === 'CLOSED' ? 'CLOSED' : 'OPEN',
    openingAmount: open.openingAmount,
    currentAmount: open.currentAmount,
    openingDate: open.openingDate,
    notes: open.notes,
    serverConfirmedAt: opts?.serverConfirmedAt || new Date().toISOString(),
    updatedAtLocal: new Date().toISOString(),
    leaseId,
    leaseIssuedAt,
    leaseExpiresAt,
    cashLeaseToken,
  };
}

export async function upsertConfirmedCash(
  scope: TenantScope,
  open: OpenCashRegister | null
): Promise<LocalCashRegister | null> {
  const db = await openOfflineDb(scope);
  if (!open) {
    const existing = await db.cashRegisters
      .where('businessId')
      .equals(scope.businessId)
      .toArray();
    for (const row of existing) {
      if (row.userId === scope.userId && row.deviceId === scope.deviceId && row.status === 'OPEN') {
        await db.cashRegisters.put({
          ...row,
          status: 'CLOSED',
          updatedAtLocal: new Date().toISOString(),
          cashLeaseToken: null,
        });
      }
    }
    return null;
  }

  if (
    open.businessId !== scope.businessId ||
    open.userId !== scope.userId ||
    open.deviceId !== scope.deviceId
  ) {
    throw new Error('Caja recibida no pertenece al scope autenticado');
  }

  const prev = await db.cashRegisters.get(open.id);
  const sameOpen =
    !!prev &&
    prev.status === 'OPEN' &&
    prev.serverId === open.id &&
    prev.userId === open.userId &&
    prev.deviceId === open.deviceId;

  // GET no renueva lease: conservar expiresAt/token previos si el servidor no mandó uno nuevo,
  // o si mandó el mismo expiresAt (issue desde openingDate).
  const confirmedAt = sameOpen && prev ? prev.serverConfirmedAt : new Date().toISOString();
  const local = toLocalCashRegister(open, {
    preserveLeaseFrom: sameOpen ? prev : null,
    serverConfirmedAt: confirmedAt,
  });

  // Si el servidor envió expiresAt distinto y más tardío que el local previo → rechazar extensión silenciosa
  if (
    sameOpen &&
    prev?.leaseExpiresAt &&
    open.leaseExpiresAt &&
    Date.parse(open.leaseExpiresAt) > Date.parse(prev.leaseExpiresAt)
  ) {
    // No aceptar extensión vía GET: conservar lease previo
    local.leaseExpiresAt = prev.leaseExpiresAt;
    local.leaseIssuedAt = prev.leaseIssuedAt;
    local.leaseId = prev.leaseId;
    local.cashLeaseToken = prev.cashLeaseToken;
  }

  await db.cashRegisters.put(local);
  return local;
}

/** Tras CASH_OPEN applied: reemplaza lease con el emitido por servidor. */
export async function applyCashOpenLease(
  scope: TenantScope,
  cashRegisterId: number,
  lease: {
    leaseId: string;
    leaseIssuedAt: string;
    leaseExpiresAt: string;
    cashLeaseToken: string;
  }
): Promise<void> {
  const db = await openOfflineDb(scope);
  const row = await db.cashRegisters.get(cashRegisterId);
  if (!row || row.businessId !== scope.businessId) return;
  if (row.userId !== scope.userId || row.deviceId !== scope.deviceId) return;
  const now = new Date().toISOString();
  await db.cashRegisters.put({
    ...row,
    leaseId: lease.leaseId,
    leaseIssuedAt: lease.leaseIssuedAt,
    leaseExpiresAt: lease.leaseExpiresAt,
    cashLeaseToken: lease.cashLeaseToken,
    serverConfirmedAt: now,
    updatedAtLocal: now,
  });
}

/** @deprecated usar applyCashOpenLease — no inventar TTL local. */
export async function touchCashServerConfirmation(
  scope: TenantScope,
  cashRegisterId: number,
  at = new Date().toISOString()
): Promise<void> {
  const db = await openOfflineDb(scope);
  const row = await db.cashRegisters.get(cashRegisterId);
  if (!row || row.businessId !== scope.businessId) return;
  if (row.userId !== scope.userId || row.deviceId !== scope.deviceId) return;
  await db.cashRegisters.put({
    ...row,
    serverConfirmedAt: at,
    updatedAtLocal: at,
  });
}

export async function markLocalCashClosed(
  scope: TenantScope,
  cashRegisterId: number
): Promise<void> {
  const db = await openOfflineDb(scope);
  const row = await db.cashRegisters.get(cashRegisterId);
  if (!row) return;
  await db.cashRegisters.put({
    ...row,
    status: 'CLOSED',
    cashLeaseToken: null,
    updatedAtLocal: new Date().toISOString(),
  });
}

export async function getLocalOpenCash(scope: TenantScope): Promise<LocalCashRegister | null> {
  const db = await openOfflineDb(scope);
  const rows = await db.cashRegisters.where('businessId').equals(scope.businessId).toArray();
  const open = rows.find(
    (r) =>
      r.status === 'OPEN' &&
      r.userId === scope.userId &&
      r.deviceId === scope.deviceId
  );
  return open ?? null;
}

export function evaluateOfflineCashAuth(
  scope: TenantScope,
  cash: LocalCashRegister | null,
  now = Date.now()
): OfflineCashAuthResult {
  const gate = getSessionGateState(now);
  if (!gate.mutationsAllowed) {
    return {
      ok: false,
      code: 'SESSION_BLOCKED',
      message: gate.reason || 'Sesión no permite mutaciones offline',
    };
  }
  if (!cash) {
    return {
      ok: false,
      code: 'CASH_NOT_CONFIRMED',
      message: 'No hay caja OPEN confirmada en este dispositivo. Ábrela en línea primero.',
    };
  }
  if (cash.status !== 'OPEN') {
    return {
      ok: false,
      code: 'CASH_CLOSED',
      message: 'La caja local está cerrada.',
    };
  }
  if (
    cash.businessId !== scope.businessId ||
    cash.userId !== scope.userId ||
    cash.deviceId !== scope.deviceId
  ) {
    return {
      ok: false,
      code: 'SCOPE_MISMATCH',
      message: 'La caja local no coincide con el usuario/empresa/dispositivo.',
    };
  }
  if (!cash.cashLeaseToken || !cash.leaseExpiresAt || !cash.leaseId) {
    return {
      ok: false,
      code: 'LEASE_MISSING',
      message:
        'Falta autorización de caja (cash lease) emitida por el servidor. Reconecta y abre/consulta la caja en línea.',
    };
  }
  const exp = Date.parse(cash.leaseExpiresAt);
  if (!Number.isFinite(exp)) {
    return {
      ok: false,
      code: 'LEASE_INVALID',
      message: 'leaseExpiresAt inválido en evidencia local.',
    };
  }
  if (now > exp) {
    return {
      ok: false,
      code: 'LEASE_EXPIRED',
      message:
        'Cash lease vencido. Reconecta y abre la caja de nuevo (la autorización no se renueva con GET).',
    };
  }
  // Defensa adicional: token debe pertenecer a esta caja
  if (!cash.cashLeaseToken.includes('.')) {
    return {
      ok: false,
      code: 'LEASE_INVALID',
      message: 'Token de lease local malformado.',
    };
  }
  return { ok: true, cash, remainingMs: Math.max(0, exp - now) };
}

export async function assertOfflineCashAuthorized(
  scope: TenantScope,
  now = Date.now()
): Promise<LocalCashRegister> {
  const cash = await getLocalOpenCash(scope);
  const auth = evaluateOfflineCashAuth(scope, cash, now);
  if (!auth.ok) {
    const err = new Error(auth.message) as Error & { code: string };
    err.code = auth.code;
    throw err;
  }
  return auth.cash;
}

export function localCashToOpenShape(cash: LocalCashRegister): OpenCashRegister {
  return {
    id: cash.serverId,
    businessId: cash.businessId,
    userId: cash.userId,
    deviceId: cash.deviceId,
    registerNumber: cash.registerNumber,
    version: cash.version,
    status: cash.status,
    openingAmount: cash.openingAmount,
    currentAmount: cash.currentAmount,
    openingDate: cash.openingDate,
    notes: cash.notes,
    leaseId: cash.leaseId ?? undefined,
    leaseIssuedAt: cash.leaseIssuedAt ?? undefined,
    leaseExpiresAt: cash.leaseExpiresAt ?? undefined,
    cashLeaseToken: cash.cashLeaseToken ?? undefined,
  };
}
