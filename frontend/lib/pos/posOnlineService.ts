/**
 * POS — mutaciones CASH_* vía /sync/push directo (siempre online).
 * Ventas: preferir persistSaleCreate + outbox (P2-C1.C); createSaleOnline queda para compat.
 * Lectura de caja: GET /cash-registers/open.
 */
import type { SyncPushResponse, SyncPushResultItem, TenantScope } from '@/lib/offline/types';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://127.0.0.1:5000';

export type OpenCashRegister = {
  id: number;
  businessId: number;
  userId: number;
  deviceId: string;
  registerNumber: string;
  version: number;
  status: string;
  openingAmount: string;
  currentAmount: string;
  openingDate: string;
  notes: string | null;
  leaseId?: string;
  leaseIssuedAt?: string;
  leaseExpiresAt?: string;
  cashLeaseToken?: string;
};

export type PosSaleLineInput = {
  businessProductId: number;
  quantity: number;
  unitPrice: number;
  baseVersion: number;
  productName: string;
  sku?: string | null;
  taxRate?: number | null;
};

export class PosOnlineError extends Error {
  constructor(
    message: string,
    public code: string,
    public result?: SyncPushResultItem | null,
    public network = false
  ) {
    super(message);
    this.name = 'PosOnlineError';
  }
}

async function pushOne(
  scope: TenantScope,
  accessToken: string,
  operation: {
    clientOperationId: string;
    operationType: string;
    baseVersion?: number | null;
    payload: Record<string, unknown>;
  }
): Promise<SyncPushResultItem> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(`${API_BASE}/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Device-Id': scope.deviceId,
      },
      body: JSON.stringify({
        businessId: scope.businessId,
        operations: [operation],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      await res.text();
      throw new PosOnlineError(`HTTP ${res.status}`, 'HTTP_ERROR', null, res.status >= 500 || res.status === 0);
    }
    const body = (await res.json()) as SyncPushResponse;
    const result = body.results?.[0];
    if (!result) {
      throw new PosOnlineError('Respuesta sync sin results', 'EMPTY_RESULT');
    }
    return result;
  } catch (err) {
    if (err instanceof PosOnlineError) throw err;
    const msg = err instanceof Error ? err.message : 'network_error';
    throw new PosOnlineError(msg, 'NETWORK', null, true);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchOpenCashRegister(
  scope: TenantScope,
  accessToken: string
): Promise<OpenCashRegister | null> {
  const res = await fetch(`${API_BASE}/cash-registers/open`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Device-Id': scope.deviceId,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new PosOnlineError(`No se pudo leer caja: HTTP ${res.status} ${text.slice(0, 120)}`, 'HTTP_ERROR');
  }
  const body = (await res.json()) as { open: OpenCashRegister | null };
  return body.open ?? null;
}

/** Resumen de jornada/caja (servidor) — P2-C1.G4 */
export type CashSessionSummary = {
  source: 'server';
  cash: {
    id: number;
    businessId: number;
    userId: number;
    username: string | null;
    deviceId: string;
    registerNumber: string;
    status: string;
    version: number;
    openingAmount: string;
    currentAmount: string;
    closingAmount: string | null;
    openingDate: string;
    closingDate: string | null;
    notes: string | null;
  };
  totals: {
    saleCashTotal: string;
    cashInTotal: string;
    cashOutTotal: string;
    expectedFromMovements: string;
    expectedAmount: string;
    countedAmount: string | null;
    difference: string | null;
    confirmedSalesCount: number;
    movementCount: number;
  };
  movements: Array<{
    id: number;
    movementType: string;
    amount: string;
    balanceAfter: string | null;
    saleId: number | null;
    commercialNumber: string | null;
    notes: string | null;
    createdAt: string;
  }>;
  confirmedSales: Array<{
    id: number;
    commercialNumber: string | null;
    totalAmount: string;
    paymentMethod: string;
    createdAt: string;
    clientOperationId: string | null;
  }>;
};

export type CashSessionEnvelope = {
  session: CashSessionSummary | null;
  previousClosed?: CashSessionSummary | null;
};

export async function fetchCashSession(
  scope: TenantScope,
  accessToken: string,
  cashRegisterId?: number | null
): Promise<CashSessionEnvelope> {
  const q =
    cashRegisterId != null && Number.isFinite(cashRegisterId)
      ? `?cashRegisterId=${encodeURIComponent(String(cashRegisterId))}`
      : '';
  const res = await fetch(`${API_BASE}/cash-registers/session${q}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Device-Id': scope.deviceId,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new PosOnlineError(
      `No se pudo leer jornada: HTTP ${res.status} ${text.slice(0, 120)}`,
      'HTTP_ERROR'
    );
  }
  const body = (await res.json()) as CashSessionEnvelope;
  return {
    session: body.session ?? null,
    previousClosed: body.previousClosed ?? null,
  };
}

export async function openCashOnline(args: {
  scope: TenantScope;
  accessToken: string;
  clientOperationId: string;
  localCashId: string;
  openingAmount: number;
  notes?: string;
}): Promise<SyncPushResultItem> {
  const result = await pushOne(args.scope, args.accessToken, {
    clientOperationId: args.clientOperationId,
    operationType: 'CASH_OPEN',
    payload: {
      localCashId: args.localCashId,
      openingAmount: args.openingAmount,
      deviceId: args.scope.deviceId,
      notes: args.notes ?? null,
    },
  });
  if (result.status !== 'applied' && result.status !== 'duplicate') {
    throw new PosOnlineError(result.message || result.code || 'Caja no abierta', result.code || 'REJECTED', result);
  }
  return result;
}

export async function closeCashOnline(args: {
  scope: TenantScope;
  accessToken: string;
  clientOperationId: string;
  cashRegisterId: number;
  closingAmount: number;
  baseVersion: number;
  notes?: string;
}): Promise<SyncPushResultItem> {
  const result = await pushOne(args.scope, args.accessToken, {
    clientOperationId: args.clientOperationId,
    operationType: 'CASH_CLOSE',
    baseVersion: args.baseVersion,
    payload: {
      cashRegisterId: args.cashRegisterId,
      closingAmount: args.closingAmount,
      notes: args.notes ?? null,
    },
  });
  if (result.status !== 'applied' && result.status !== 'duplicate') {
    throw new PosOnlineError(result.message || result.code || 'Caja no cerrada', result.code || 'REJECTED', result);
  }
  return result;
}

export async function createSaleOnline(args: {
  scope: TenantScope;
  accessToken: string;
  clientOperationId: string;
  localSaleId: string;
  cashRegisterId: number;
  lines: PosSaleLineInput[];
  discountAmount?: number;
  notes?: string;
}): Promise<SyncPushResultItem> {
  const result = await pushOne(args.scope, args.accessToken, {
    clientOperationId: args.clientOperationId,
    operationType: 'SALE_CREATE',
    payload: {
      localSaleId: args.localSaleId,
      cashRegisterId: args.cashRegisterId,
      paymentMethod: 'CASH',
      discountAmount: args.discountAmount ?? 0,
      notes: args.notes ?? null,
      lines: args.lines.map((l) => ({
        businessProductId: l.businessProductId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        baseVersion: l.baseVersion,
      })),
    },
  });
  if (result.status !== 'applied' && result.status !== 'duplicate') {
    throw new PosOnlineError(result.message || result.code || 'Venta rechazada', result.code || 'REJECTED', result);
  }
  return result;
}

const PENDING_KEY = 'supertienda_pos_pending_sale';

export type PendingSaleRecord = {
  clientOperationId: string;
  localSaleId: string;
  cashRegisterId: number;
  businessId: number;
  deviceId: string;
  lines: PosSaleLineInput[];
  cashReceived: number;
  createdAt: string;
};

export function savePendingSale(rec: PendingSaleRecord) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(rec));
}

export function loadPendingSale(): PendingSaleRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingSaleRecord;
  } catch {
    return null;
  }
}

export function clearPendingSale() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_KEY);
}
