'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  ChevronDown,
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useCommercialCatalog } from '@/hooks/useCommercialCatalog';
import { PosOfflineHeaderStatus } from '@/components/features/pos/PosOfflineHeaderStatus';
import { getAuthToken } from '@/lib/auth-utils';
import {
  getConnectionStatus,
  probeApiHealth,
  subscribeConnection,
} from '@/lib/offline/connectivity';
import { warmPwaShellCache } from '@/lib/pwa/warmShellCache';
import type { CommercialCatalogRow } from '@/lib/catalog/commercialTypes';
import {
  clearPendingSale,
  closeCashOnline,
  fetchOpenCashRegister,
  openCashOnline,
  PosOnlineError,
  type OpenCashRegister,
  type PosSaleLineInput,
} from '@/lib/pos/posOnlineService';
import {
  evaluateOfflineCashAuth,
  getLocalOpenCash,
  localCashToOpenShape,
  markLocalCashClosed,
  OFFLINE_CASH_AUTH_MAX_MS,
  applyCashOpenLease,
  upsertConfirmedCash,
} from '@/lib/pos/posCashAuth';
import {
  flushPosOutbox,
  getLocalSaleByClientOp,
  listPendingLocalSales,
  listRecentConfirmedLocalSales,
  migrateSessionPendingSale,
  persistSaleCreate,
} from '@/lib/pos/posSaleOfflineService';
import type { LocalSale } from '@/lib/offline/types';
import { PosReceipt, type PosReceiptData } from '@/components/features/pos/PosReceipt';
import { CatalogGridSkeleton } from '@/components/ui/skeleton';
import { PosDayControlPanel } from '@/components/features/pos/PosDayControlPanel';
import {
  computeChange,
  computeCommercialTotals,
  resolveTaxRate,
} from '@/lib/pos/commercialTotals';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type CartLine = {
  key: string;
  businessProductId: number;
  productServerId: number | null;
  name: string;
  sku: string | null;
  unitPrice: number;
  taxRate: number;
  baseVersion: number;
  availableStock: number;
  quantity: number;
};

function money(n: number) {
  return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function uuid() {
  return crypto.randomUUID();
}

function PosPageInner() {
  const { user } = useAuth();
  const cat = useCommercialCatalog();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [cashExpanded, setCashExpanded] = useState(false);
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);
  const lastAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cash, setCash] = useState<OpenCashRegister | null>(null);
  const [cashLoading, setCashLoading] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('100');
  const [closingAmount, setClosingAmount] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [connection, setConnection] = useState(getConnectionStatus());
  const [receipt, setReceipt] = useState<PosReceiptData | null>(null);
  const [pendingSales, setPendingSales] = useState<LocalSale[]>([]);
  const [confirmedSales, setConfirmedSales] = useState<LocalSale[]>([]);
  const [cashAuthHint, setCashAuthHint] = useState<string | null>(null);
  const [pwaReady, setPwaReady] = useState(false);
  const [dayPanelRefreshKey, setDayPanelRefreshKey] = useState(0);
  const chargeLock = useRef(false);
  const wasOffline = useRef(false);

  const bumpDayPanel = useCallback(() => {
    setDayPanelRefreshKey((k) => k + 1);
  }, []);

  const scope = cat.scope;
  const businessLabel = user?.employee
    ? `${user.employee.firstName} ${user.employee.lastName}`.trim() || `Empresa #${user.businessId}`
    : `Empresa #${user?.businessId ?? '—'}`;

  useEffect(() => subscribeConnection(setConnection), []);

  const refreshPendingSales = useCallback(async () => {
    if (!scope) return;
    const [pending, confirmed] = await Promise.all([
      listPendingLocalSales(scope),
      listRecentConfirmedLocalSales(scope, 8),
    ]);
    setPendingSales(pending);
    setConfirmedSales(confirmed);
  }, [scope]);

  const refreshCash = useCallback(async () => {
    if (!scope) return;
    setCashLoading(true);
    try {
      const token = getAuthToken();
      if (token && connection === 'online') {
        try {
          const open = await fetchOpenCashRegister(scope, token);
          await upsertConfirmedCash(scope, open);
          setCash(open);
          if (open) setClosingAmount(open.currentAmount);
          setCashAuthHint(null);
          return;
        } catch (e) {
          // Fallback a evidencia local si la red falla mid-request
          if (!(e instanceof PosOnlineError && e.network)) {
            setError(e instanceof Error ? e.message : 'Error leyendo caja');
          }
        }
      }
      const local = await getLocalOpenCash(scope);
      const auth = evaluateOfflineCashAuth(scope, local);
      if (auth.ok) {
        setCash(localCashToOpenShape(auth.cash));
        setClosingAmount(auth.cash.currentAmount);
        const hrs = Math.floor(auth.remainingMs / 3_600_000);
        setCashAuthHint(
          `Caja local (última confirmación servidor). Autorización offline ~${hrs}h restantes (máx. ${OFFLINE_CASH_AUTH_MAX_MS / 3_600_000}h).`
        );
      } else {
        setCash(null);
        setCashAuthHint(auth.message);
      }
    } finally {
      setCashLoading(false);
    }
  }, [scope, connection]);

  useEffect(() => {
    void refreshCash();
  }, [refreshCash]);

  useEffect(() => {
    if (!scope) return;
    void (async () => {
      await migrateSessionPendingSale(scope);
      await refreshPendingSales();
      const pending = await listPendingLocalSales(scope);
      if (pending.length) {
        setInfo(
          `Hay ${pending.length} venta(s) provisional(es) en este dispositivo. Se sincronizan al recuperar conexión.`
        );
      }
    })();
  }, [scope, refreshPendingSales]);

  // Al recuperar conectividad real: probe backend + outbox (sin segunda cola SW)
  useEffect(() => {
    if (connection === 'offline') {
      wasOffline.current = true;
      return;
    }
    if (connection !== 'online' || !wasOffline.current || !scope) return;
    wasOffline.current = false;
    void (async () => {
      const ok = await probeApiHealth();
      if (!ok) return;
      const token = getAuthToken();
      if (!token) return;
      try {
        setInfo('Conexión recuperada — sincronizando cola…');
        const beforeIds = new Set(
          (await listRecentConfirmedLocalSales(scope, 20)).map((s) => s.localId)
        );
        await flushPosOutbox({ scope, accessToken: token });
        await refreshPendingSales();
        await refreshCash();
        await cat.reload();
        const after = await listRecentConfirmedLocalSales(scope, 20);
        const newly = after.filter((s) => !beforeIds.has(s.localId));
        if (newly.length > 0) {
          const labels = newly
            .map((s) => s.commercialNumber || `LOCAL-${s.localId.slice(0, 8)}`)
            .join(', ');
          setInfo(
            `Cola sincronizada. Confirmadas: ${labels}. Revisa «Últimas confirmadas» para ver el ticket.`
          );
        } else {
          setInfo('Cola sincronizada tras reconexión.');
        }
        bumpDayPanel();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al sincronizar tras reconexión');
        bumpDayPanel();
      }
    })();
  }, [connection, scope, refreshPendingSales, refreshCash, cat, bumpDayPanel]);

  const preparePwaOffline = async () => {
    if (!scope || busy) return;
    if (connection !== 'online') {
      setError('Preparar PWA requiere conexión.');
      return;
    }
    const local = await getLocalOpenCash(scope);
    const auth = evaluateOfflineCashAuth(scope, local);
    if (!auth.ok) {
      setError(
        auth.message ||
          'Antes de preparar offline: inicia sesión, sincroniza catálogo, abre caja y obtén lease válido.'
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await cat.syncNow();
      const result = await warmPwaShellCache(['/ventas', '/productos', '/inventario', '/dashboard']);
      setPwaReady(result.warmed > 0);
      setInfo(
        result.controller
          ? `PWA lista: shell cacheada (${result.warmed} URLs). Podés cerrar la pestaña y reabrir /ventas sin red.`
          : 'Service Worker aún sin control. Recargá una vez online y volvé a preparar.'
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo preparar PWA');
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = cat.search.trim().toLowerCase();
    const rows = cat.rows.filter((r) => r.customPrice != null && r.bpServerId != null);
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.sku || '').toLowerCase().includes(q) ||
        String(r.productServerId || '').includes(q)
    );
  }, [cat.rows, cat.search]);

  const cartTotals = useMemo(
    () =>
      computeCommercialTotals(
        cart.map((l) => ({
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          name: l.name,
        }))
      ),
    [cart]
  );
  const subtotal = cartTotals.subtotal;
  const cartTax = cartTotals.taxAmount;
  const cartTotal = cartTotals.totalAmount;

  const addProduct = (row: CommercialCatalogRow) => {
    if (!cash) {
      setError('Abre la caja antes de vender.');
      return;
    }
    if (row.bpServerId == null || row.customPrice == null) {
      setError('Producto sin precio o sin vínculo de empresa.');
      return;
    }
    const stock = row.availableStock ?? 0;
    const bpVersion = row.bpVersion ?? 0;
    if (stock <= 0) {
      setError('Sin stock disponible.');
      return;
    }
    setError(null);
    const key = String(row.bpServerId);
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        if (existing.quantity >= existing.availableStock) {
          setError('Cantidad supera stock disponible.');
          return prev;
        }
        return prev.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + 1, baseVersion: bpVersion } : l
        );
      }
      return [
        ...prev,
        {
          key,
          businessProductId: row.bpServerId!,
          productServerId: row.productServerId,
          name: row.name,
          sku: row.sku,
          unitPrice: row.customPrice!,
          taxRate: resolveTaxRate(row.taxRate),
          baseVersion: bpVersion,
          availableStock: stock,
          quantity: 1,
        },
      ];
    });
    // Feedback visual breve (presentación); no altera cobro.
    setLastAddedKey(key);
    if (lastAddedTimer.current) clearTimeout(lastAddedTimer.current);
    lastAddedTimer.current = setTimeout(() => setLastAddedKey(null), 320);
  };

  const setQty = (key: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.key !== key) return l;
          const next = Math.floor(qty);
          if (next <= 0) return null as unknown as CartLine;
          if (next > l.availableStock) {
            setError(`Stock máximo para ${l.name}: ${l.availableStock}`);
            return { ...l, quantity: l.availableStock };
          }
          return { ...l, quantity: next };
        })
        .filter(Boolean)
    );
  };

  const removeLine = (key: string) => setCart((prev) => prev.filter((l) => l.key !== key));

  const handleOpenCash = async () => {
    if (!scope || busy) return;
    const token = getAuthToken();
    if (!token) return;
    const amount = Number(openingAmount);
    if (Number.isNaN(amount) || amount < 0) {
      setError('Monto de apertura inválido');
      return;
    }
    if (connection !== 'online') {
      setError('Se requiere conexión para abrir caja.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await openCashOnline({
        scope,
        accessToken: token,
        clientOperationId: uuid(),
        localCashId: uuid(),
        openingAmount: amount,
        notes: 'Apertura POS UI',
      });
      setInfo(result.status === 'duplicate' ? 'Caja ya registrada (idempotente).' : 'Caja abierta.');
      await refreshCash();
      const server = (result.server || {}) as Record<string, unknown>;
      const leaseId = typeof server['leaseId'] === 'string' ? server['leaseId'] : null;
      const leaseIssuedAt =
        typeof server['leaseIssuedAt'] === 'string' ? server['leaseIssuedAt'] : null;
      const leaseExpiresAt =
        typeof server['leaseExpiresAt'] === 'string' ? server['leaseExpiresAt'] : null;
      const cashLeaseToken =
        typeof server['cashLeaseToken'] === 'string' ? server['cashLeaseToken'] : null;
      const cashId =
        result.serverEntityId ??
        (await getLocalOpenCash(scope))?.serverId ??
        null;
      if (cashId != null && leaseId && leaseIssuedAt && leaseExpiresAt && cashLeaseToken) {
        await applyCashOpenLease(scope, cashId, {
          leaseId,
          leaseIssuedAt,
          leaseExpiresAt,
          cashLeaseToken,
        });
      }
      await refreshCash();
      await refreshPendingSales();
      bumpDayPanel();
    } catch (e) {
      const err = e as PosOnlineError;
      setError(err.message || 'No se pudo abrir caja');
    } finally {
      setBusy(false);
    }
  };

  const handleCloseCash = async () => {
    if (!scope || !cash || busy) return;
    const token = getAuthToken();
    if (!token) return;
    const counted = Number(closingAmount);
    if (Number.isNaN(counted) || counted < 0) {
      setError('Efectivo contado inválido');
      return;
    }
    if (connection !== 'online') {
      setError('Se requiere conexión para cerrar caja.');
      return;
    }
    const pendingNow = await listPendingLocalSales(scope);
    if (pendingNow.length > 0) {
      setPendingSales(pendingNow);
      setError(
        `No se puede cerrar la caja: hay ${pendingNow.length} venta(s) provisional(es) pendientes de sincronizar. Sincronízalas o resuélvelas primero.`
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await closeCashOnline({
        scope,
        accessToken: token,
        clientOperationId: uuid(),
        cashRegisterId: cash.id,
        closingAmount: counted,
        baseVersion: cash.version,
        notes: 'Cierre POS UI',
      });
      const server = result.server ?? {};
      const diff = server['difference'];
      setInfo(
        `Caja cerrada. Esperado Bs ${String(server['expectedAmount'] ?? cash.currentAmount)}; contado Bs ${counted.toFixed(2)}; diferencia ${diff ?? '—'}.`
      );
      setCart([]);
      await markLocalCashClosed(scope, cash.id);
      await refreshCash();
      bumpDayPanel();
    } catch (e) {
      const err = e as PosOnlineError;
      setError(err.message || 'No se pudo cerrar caja');
      await refreshCash();
      bumpDayPanel();
    } finally {
      setBusy(false);
    }
  };

  const buildLinesFromCart = (source: CartLine[]): PosSaleLineInput[] =>
    source.map((l) => ({
      businessProductId: l.businessProductId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      baseVersion: l.baseVersion,
      productName: l.name,
      sku: l.sku,
      taxRate: l.taxRate,
    }));

  const showReceiptFromSale = (
    sale: LocalSale,
    provisional: boolean,
    opts?: {
      serverTotal?: number | null;
      serverSubtotal?: number | null;
      serverTax?: number | null;
      totalsAdjusted?: boolean;
    }
  ) => {
    const localTotals = computeCommercialTotals(
      sale.lines.map((l) => ({
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        name: l.productName,
      })),
      sale.discountAmount
    );
    const useServer = !provisional && opts?.serverTotal != null && Number.isFinite(opts.serverTotal);
    const total = useServer ? Number(opts!.serverTotal) : localTotals.totalAmount;
    const sub = useServer && opts?.serverSubtotal != null ? Number(opts.serverSubtotal) : localTotals.subtotal;
    const tax = useServer && opts?.serverTax != null ? Number(opts.serverTax) : localTotals.taxAmount;
    const change = computeChange(sale.cashReceived, total);
    setReceipt({
      businessLabel: `SuperTienda · ${businessLabel}`,
      commercialNumber: provisional
        ? `LOCAL-${sale.localId.slice(0, 8).toUpperCase()}`
        : String(sale.commercialNumber || ''),
      soldAt: sale.confirmedAt || sale.createdAtLocal,
      lines: localTotals.lines.map((l) => ({
        name: l.name || 'Ítem',
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
        lineSubtotal: l.lineSubtotal,
        lineTax: l.lineTax,
        taxRate: l.taxRate,
      })),
      subtotal: sub,
      taxAmount: tax,
      discountAmount: sale.discountAmount,
      totalAmount: total,
      cashReceived: sale.cashReceived,
      change,
      provisional,
      localSaleId: sale.localId,
      totalsAdjusted: !!opts?.totalsAdjusted,
      provisionalTotal: sale.provisionalTotal,
    });
  };

  const syncPendingSale = async (sale: LocalSale) => {
    if (!scope || busy || chargeLock.current) return;
    const token = getAuthToken();
    if (!token) {
      setError('Sesión requerida para sincronizar la venta.');
      return;
    }
    if (connection !== 'online') {
      setError('Sin conexión: la venta provisional permanece en outbox. No está confirmada.');
      return;
    }
    chargeLock.current = true;
    setBusy(true);
    setError(null);
    setInfo('Sincronizando venta pendiente…');
    try {
      const { results } = await flushPosOutbox({ scope, accessToken: token });
      const mine = results.find((r) => r.clientOperationId === sale.clientOperationId);
      const refreshed = await getLocalSaleByClientOp(scope, sale.clientOperationId);
      if (refreshed?.syncStatus === 'confirmed') {
        clearPendingSale();
        const srv = (mine?.server || refreshed.serverResult?.['server'] || {}) as Record<
          string,
          unknown
        >;
        const serverTotal =
          srv['totalAmount'] != null && Number.isFinite(Number(srv['totalAmount']))
            ? Number(srv['totalAmount'])
            : refreshed.confirmedTotal ?? null;
        showReceiptFromSale(refreshed, false, {
          serverTotal,
          serverSubtotal:
            srv['subtotal'] != null ? Number(srv['subtotal']) : refreshed.confirmedSubtotal,
          serverTax:
            srv['taxAmount'] != null ? Number(srv['taxAmount']) : refreshed.confirmedTax,
          totalsAdjusted: refreshed.totalsAdjusted,
        });
        const comLabel = refreshed.commercialNumber || 'COM';
        setInfo(
          mine?.status === 'duplicate'
            ? `Venta confirmada ${comLabel} (reintento idempotente).`
            : refreshed.totalsAdjusted
              ? `Venta confirmada ${comLabel}. Total servidor Bs ${money(serverTotal ?? 0)} (difiere del provisional).`
              : `Venta confirmada ${comLabel}.`
        );
        await cat.syncNow();
        await refreshCash();
      } else if (mine?.code === 'VERSION_CONFLICT') {
        setError(
          'VERSION_CONFLICT: la versión de stock/precio cambió. No es un duplicado de una venta ya aplicada — sincroniza catálogo y reintenta con baseVersion fresca.'
        );
        await cat.syncNow();
      } else if (mine?.code === 'PRICE_MISMATCH') {
        setError(`Precio no autorizado: ${mine.message || ''}. Sincroniza el catálogo.`);
        await cat.syncNow();
      } else if (mine?.code === 'INSUFFICIENT_STOCK') {
        setError(`Stock insuficiente: ${mine.message || ''}`);
        await cat.syncNow();
      } else if (mine?.code === 'CASH_CLOSED') {
        setError('La caja está cerrada en servidor. No se puede confirmar la venta.');
        await refreshCash();
      } else if (refreshed?.syncStatus === 'rejected' || refreshed?.syncStatus === 'dead') {
        setError(refreshed.lastError || 'Venta rechazada');
      } else {
        setError('La venta aún no está confirmada. Se conservó el clientOperationId.');
      }
      await refreshPendingSales();
      bumpDayPanel();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo sincronizar. La venta provisional sigue en IndexedDB.'
      );
      await refreshPendingSales();
      bumpDayPanel();
    } finally {
      setBusy(false);
      chargeLock.current = false;
    }
  };

  const confirmSale = async () => {
    if (!scope || !cash || busy || chargeLock.current) return;

    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    if (cart.some((l) => l.quantity <= 0)) {
      setError('Cantidades inválidas');
      return;
    }
    const received = Number(cashReceived);
    if (Number.isNaN(received) || received < cartTotal) {
      setError(
        `Efectivo recibido insuficiente (total c/IVA Bs ${money(cartTotal)}; el servidor confirma el importe definitivo).`
      );
      return;
    }

    const localCash = await getLocalOpenCash(scope);
    const auth = evaluateOfflineCashAuth(scope, localCash);
    if (!auth.ok) {
      setError(auth.message);
      return;
    }

    chargeLock.current = true;
    setBusy(true);
    setError(null);
    setInfo(
      connection === 'online'
        ? 'Registrando venta y confirmando en servidor…'
        : 'Registrando venta provisional offline…'
    );

    try {
      const lines = buildLinesFromCart(cart);
      const { sale } = await persistSaleCreate(scope, {
        cashRegisterId: cash.id,
        lines,
        cashReceived: received,
        notes: 'Venta POS UI',
      });

      setCart([]);
      setCashReceived('');
      setMobileCartOpen(false);
      await cat.reload();
      await refreshPendingSales();

      if (connection !== 'online') {
        showReceiptFromSale(sale, true);
        setInfo(
          'Venta provisional guardada en este dispositivo. NO confirmada. Se sincronizará al recuperar red.'
        );
        bumpDayPanel();
        return;
      }

      const token = getAuthToken();
      if (!token) {
        showReceiptFromSale(sale, true);
        setError('Sin token: venta provisional local. Reintenta sync al iniciar sesión.');
        bumpDayPanel();
        return;
      }

      try {
        const { results } = await flushPosOutbox({ scope, accessToken: token });
        const mine = results.find((r) => r.clientOperationId === sale.clientOperationId);
        const refreshed = await getLocalSaleByClientOp(scope, sale.clientOperationId);
        if (refreshed?.syncStatus === 'confirmed') {
          clearPendingSale();
          const srv = (mine?.server || {}) as Record<string, unknown>;
          const serverTotal =
            srv['totalAmount'] != null && Number.isFinite(Number(srv['totalAmount']))
              ? Number(srv['totalAmount'])
              : refreshed.confirmedTotal ?? null;
          showReceiptFromSale(refreshed, false, {
            serverTotal,
            serverSubtotal: srv['subtotal'] != null ? Number(srv['subtotal']) : null,
            serverTax: srv['taxAmount'] != null ? Number(srv['taxAmount']) : null,
            totalsAdjusted: refreshed.totalsAdjusted,
          });
          const comLabel = refreshed.commercialNumber || 'COM';
          setInfo(
            mine?.status === 'duplicate'
              ? `Venta confirmada ${comLabel} (reintento idempotente).`
              : refreshed.totalsAdjusted
                ? `Venta confirmada ${comLabel}. Total servidor Bs ${money(serverTotal ?? 0)} (aviso: difiere del provisional).`
                : `Venta confirmada ${comLabel}.`
          );
          await cat.syncNow();
          await refreshCash();
          await refreshPendingSales();
          bumpDayPanel();
          return;
        }
        showReceiptFromSale(sale, true);
        if (mine?.code === 'VERSION_CONFLICT') {
          setError(
            'VERSION_CONFLICT: stock/precio desactualizado (no es duplicado de venta aplicada). Sync catálogo y reintenta.'
          );
        } else if (mine?.code) {
          setError(`${mine.code}: ${mine.message || 'Venta no confirmada'}`);
        } else {
          setError(
            'No se recibió confirmación del servidor. La venta provisional permanece para reintento idempotente.'
          );
        }
        await refreshPendingSales();
        bumpDayPanel();
      } catch {
        showReceiptFromSale(sale, true);
        setError(
          'Conexión perdida tras registrar: la venta NO está confirmada. Conservamos clientOperationId en IndexedDB.'
        );
        await refreshPendingSales();
        bumpDayPanel();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo registrar la venta';
      const code = (e as { code?: string }).code;
      setError(code ? `${code}: ${msg}` : msg);
    } finally {
      setBusy(false);
      chargeLock.current = false;
    }
  };

  if (!cat.canRead || !scope) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
        Inicia sesión con un usuario de empresa (ADMIN o EMPLOYEE) para usar el POS.
      </div>
    );
  }

  const renderCartPanel = (opts?: { embedInSheet?: boolean }) => (
    <div className="flex h-full min-h-0 flex-col" data-testid="pos-cart">
      {!opts?.embedInSheet ? (
        <div className="flex items-center justify-between border-b px-3 py-2">
          <h2 className="text-sm font-semibold text-[#1e1e1e]">Carrito</h2>
          <span className="text-xs text-muted-foreground">{cart.length} ítems</span>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {cart.length === 0 ? (
          <p className="text-sm text-muted-foreground">Agrega productos del catálogo.</p>
        ) : (
          cart.map((l) => (
            <div key={l.key} className="rounded-md border bg-[#fafafa] p-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1e1e1e]">{l.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Bs {money(l.unitPrice)} · stock {l.availableStock}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e1e1e]"
                  aria-label={`Quitar ${l.name}`}
                  onClick={() => removeLine(l.key)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-10 w-10"
                  aria-label="Menos"
                  onClick={() => setQty(l.key, l.quantity - 1)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Input
                  className="h-10 w-14 text-center tabular-nums"
                  value={l.quantity}
                  aria-label={`Cantidad ${l.name}`}
                  onChange={(e) => setQty(l.key, Number(e.target.value))}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-10 w-10"
                  aria-label="Más"
                  onClick={() => setQty(l.key, l.quantity + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <span className="ml-auto text-sm font-medium tabular-nums">
                  Bs {money(l.unitPrice * l.quantity)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="space-y-2 border-t p-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">Bs {money(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">IVA</span>
          <span className="tabular-nums">Bs {money(cartTax)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="tabular-nums">Bs {money(cartTotal)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Precio unitario neto + IVA por producto (misma fórmula que el servidor). El importe
          definitivo lo confirma el servidor al sincronizar.
        </p>
        <label className="block text-xs text-muted-foreground">
          Efectivo recibido
          <Input
            className="mt-1 h-11"
            inputMode="decimal"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            placeholder="0.00"
            disabled={!cash || cart.length === 0 || busy}
          />
        </label>
        {cashReceived && !Number.isNaN(Number(cashReceived)) ? (
          <p className="text-xs text-muted-foreground">
            Cambio: Bs {money(computeChange(Number(cashReceived), cartTotal))}
          </p>
        ) : null}
        <Button
          className="h-12 w-full bg-[#1e1e1e] hover:bg-[#2e2e2e]"
          disabled={!cash || cart.length === 0 || busy}
          onClick={() => void confirmSale()}
        >
          {busy ? 'Procesando…' : connection === 'online' ? 'Cobrar efectivo' : 'Cobrar offline (provisional)'}
        </Button>
        {!cash ? <p className="text-xs text-amber-800">Se requiere caja abierta confirmada.</p> : null}
        {connection !== 'online' ? (
          <p className="text-xs text-amber-800">
            Sin red: se registrará venta provisional en IndexedDB. No genera número comercial definitivo.
          </p>
        ) : null}
      </div>
    </div>
  );

  const cashStatusLabel = cashLoading
    ? 'Consultando…'
    : cash
      ? `OPEN · ${cash.registerNumber} · saldo ref. Bs ${money(Number(cash.currentAmount))}`
      : 'Sin caja OPEN';

  return (
    <div className="relative pb-24 lg:pb-0" data-testid="pos-page">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="order-1 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[#1e1e1e] lg:text-2xl">Ventas</h1>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                  connection === 'online'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-800'
                )}
                data-testid="pos-connection-pill"
              >
                {connection === 'online' ? 'En línea' : 'Sin conexión'}
              </span>
            </div>
            <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
              POS offline-capable · CASH · comprobante comercial no fiscal
            </p>
            <PosOfflineHeaderStatus scope={scope} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 lg:h-9"
              disabled={cat.syncing}
              onClick={() => void cat.syncNow()}
            >
              <RefreshCw className={cn('h-4 w-4', cat.syncing && 'motion-safe:animate-spin')} />
              Sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden h-10 gap-2 sm:inline-flex lg:h-9"
              data-testid="pwa-prepare"
              disabled={busy || connection !== 'online'}
              onClick={() => void preparePwaOffline()}
            >
              {pwaReady ? 'PWA lista' : 'Preparar offline'}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="order-2 flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
        {info ? (
          <div className="order-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {info}
          </div>
        ) : null}
        {cashAuthHint ? (
          <div className="order-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            {cashAuthHint}
          </div>
        ) : null}

        {pendingSales.length > 0 ? (
          <div className="order-3 space-y-2 rounded-md border border-slate-200 bg-white p-3" data-testid="pos-pending-sales">
            <p className="text-sm font-medium text-[#1e1e1e]">
              Ventas provisionales ({pendingSales.length})
            </p>
            {pendingSales.map((s) => (
              <div
                key={s.clientOperationId}
                className="flex flex-col gap-2 rounded border bg-[#fafafa] p-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-xs text-muted-foreground">
                  LOCAL-{s.localId.slice(0, 8).toUpperCase()} · Bs {money(s.provisionalTotal)} ·{' '}
                  {s.syncStatus}
                </p>
                <Button
                  size="sm"
                  className="h-10 bg-[#1e1e1e] hover:bg-[#2e2e2e] sm:h-9"
                  disabled={busy || connection !== 'online'}
                  onClick={() => void syncPendingSale(s)}
                >
                  Sincronizar
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="order-4 grid gap-4 lg:order-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <section className="rounded-lg border bg-white" data-testid="pos-catalog">
            <div className="sticky top-0 z-10 border-b bg-white/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-11 pl-9"
                  placeholder="Buscar por nombre, SKU o código…"
                  value={cat.search}
                  onChange={(e) => cat.setSearch(e.target.value)}
                  aria-label="Buscar productos"
                />
              </div>
            </div>
            {cat.loading ? (
              <CatalogGridSkeleton count={8} />
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No hay productos. Sincroniza el catálogo o adopta productos compartidos en{' '}
                <a className="underline" href="/productos">
                  Catálogo
                </a>
                .
              </div>
            ) : (
              <div className="grid max-h-[min(62vh,520px)] grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-3 xl:grid-cols-4">
                {filtered.map((row) => {
                  const key = String(row.bpServerId ?? row.bpLocalId);
                  const flash = lastAddedKey === key;
                  return (
                    <button
                      key={row.bpLocalId}
                      type="button"
                      disabled={!cash || (row.availableStock ?? 0) <= 0 || busy}
                      onClick={() => addProduct(row)}
                      className={cn(
                        'min-h-[5.5rem] rounded-md border bg-[#fafafa] p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e1e1e] hover:border-[#1e1e1e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100',
                        flash && 'border-[#1e1e1e] ring-2 ring-[#1e1e1e]/30 motion-safe:animate-pulse'
                      )}
                    >
                      <p className="line-clamp-2 text-sm font-medium text-[#1e1e1e]">{row.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{row.sku || 'Sin SKU'}</p>
                      <p className="mt-2 text-sm font-semibold tabular-nums">
                        Bs {money(row.customPrice ?? 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Stock {row.availableStock ?? 0}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="hidden h-[70vh] overflow-hidden rounded-lg border bg-white lg:block">
            {renderCartPanel()}
          </aside>
        </div>

        <div className="order-5 lg:order-3">
          <PosDayControlPanel
            scope={scope}
            connection={connection}
            syncBusy={busy}
            refreshKey={dayPanelRefreshKey}
            onSyncPending={(s) => void syncPendingSale(s)}
          />
        </div>

        {confirmedSales.length > 0 ? (
          <div
            className="order-7 space-y-2 rounded-md border border-emerald-200 bg-emerald-50/40 p-3 lg:order-5"
            data-testid="pos-confirmed-sales"
          >
            <p className="text-sm font-medium text-[#1e1e1e]">
              Últimas confirmadas ({confirmedSales.length})
            </p>
            {confirmedSales.map((s) => (
              <div
                key={s.clientOperationId}
                className="flex flex-col gap-2 rounded border border-emerald-100 bg-white p-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold tabular-nums text-emerald-900">
                    {s.commercialNumber}
                  </span>
                  {' · '}
                  Bs {money(s.confirmedTotal ?? s.provisionalTotal)}
                  {' · '}
                  confirmada
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 sm:h-9"
                  onClick={() =>
                    showReceiptFromSale(s, false, {
                      serverTotal: s.confirmedTotal,
                      serverSubtotal: s.confirmedSubtotal,
                      serverTax: s.confirmedTax,
                      totalsAdjusted: s.totalsAdjusted,
                    })
                  }
                >
                  Ver ticket
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <section className="order-6 rounded-lg border bg-white lg:order-6" data-testid="pos-cash-panel">
          <Collapsible open={cashExpanded} onOpenChange={setCashExpanded}>
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="flex min-w-0 items-start gap-2">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1e1e1e]">Caja del dispositivo</p>
                  <p
                    className={cn(
                      'truncate text-xs',
                      cash ? 'text-muted-foreground' : 'text-amber-800'
                    )}
                  >
                    {cashStatusLabel}
                    {cash && connection !== 'online' ? ' · evidencia local' : ''}
                  </p>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-10 shrink-0 gap-1 lg:hidden"
                  data-testid="pos-cash-toggle"
                  aria-expanded={cashExpanded}
                >
                  {cashExpanded ? 'Ocultar' : 'Gestionar'}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform motion-reduce:transition-none',
                      cashExpanded && 'rotate-180'
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="hidden border-t px-3 pb-3 pt-1 lg:block">
              <div className="flex flex-wrap items-end gap-2">
                {!cash ? (
                  <>
                    <label className="text-xs text-muted-foreground">
                      Monto inicial
                      <Input
                        className="mt-1 h-10 w-28"
                        value={openingAmount}
                        onChange={(e) => setOpeningAmount(e.target.value)}
                        inputMode="decimal"
                      />
                    </label>
                    <Button
                      size="sm"
                      className="h-10"
                      disabled={busy || connection !== 'online'}
                      onClick={() => void handleOpenCash()}
                    >
                      Abrir caja
                    </Button>
                  </>
                ) : (
                  <>
                    <label className="text-xs text-muted-foreground">
                      Efectivo contado
                      <Input
                        className="mt-1 h-10 w-28"
                        value={closingAmount}
                        onChange={(e) => setClosingAmount(e.target.value)}
                        inputMode="decimal"
                      />
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10"
                      disabled={busy || connection !== 'online' || pendingSales.length > 0}
                      onClick={() => void handleCloseCash()}
                      title={
                        pendingSales.length > 0
                          ? 'Sincroniza las ventas provisionales antes de cerrar'
                          : undefined
                      }
                    >
                      Cerrar caja
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-10"
                  disabled={cashLoading}
                  onClick={() => void refreshCash()}
                >
                  Actualizar
                </Button>
              </div>
            </div>
            <CollapsibleContent className="lg:hidden">
              <div className="space-y-2 border-t px-3 pb-3 pt-2">
                {!cash ? (
                  <p className="text-xs text-amber-800">
                    Abrir requiere conexión (CASH_OPEN offline no permitido).
                  </p>
                ) : null}
                <div className="flex flex-wrap items-end gap-2">
                  {!cash ? (
                    <>
                      <label className="text-xs text-muted-foreground">
                        Monto inicial
                        <Input
                          className="mt-1 h-11 w-28"
                          value={openingAmount}
                          onChange={(e) => setOpeningAmount(e.target.value)}
                          inputMode="decimal"
                        />
                      </label>
                      <Button
                        size="sm"
                        className="h-11"
                        disabled={busy || connection !== 'online'}
                        onClick={() => void handleOpenCash()}
                      >
                        Abrir caja
                      </Button>
                    </>
                  ) : (
                    <>
                      <label className="text-xs text-muted-foreground">
                        Efectivo contado
                        <Input
                          className="mt-1 h-11 w-28"
                          value={closingAmount}
                          onChange={(e) => setClosingAmount(e.target.value)}
                          inputMode="decimal"
                        />
                      </label>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-11"
                        disabled={busy || connection !== 'online' || pendingSales.length > 0}
                        onClick={() => void handleCloseCash()}
                        title={
                          pendingSales.length > 0
                            ? 'Sincroniza las ventas provisionales antes de cerrar'
                            : undefined
                        }
                      >
                        Cerrar caja
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-11"
                    disabled={cashLoading}
                    onClick={() => void refreshCash()}
                  >
                    Actualizar
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>
      </div>

      <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
        <SheetContent
          side="bottom"
          className="z-[60] flex h-[min(90dvh,720px)] w-full flex-col gap-0 overflow-hidden border-t bg-white p-0 sm:max-w-none lg:hidden"
          data-testid="pos-cart-sheet"
        >
          <SheetHeader className="shrink-0 border-b bg-white px-4 py-3 pr-12 text-left">
            <SheetTitle>Carrito</SheetTitle>
            <SheetDescription>
              {cart.length} ítem(s) · Total Bs {money(cartTotal)}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-hidden bg-white">
            {renderCartPanel({ embedInSheet: true })}
          </div>
        </SheetContent>
      </Sheet>

      {!mobileCartOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t bg-white px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
          data-testid="pos-mobile-checkout-bar"
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">Total</p>
              <p className="truncate text-lg font-semibold tabular-nums text-[#1e1e1e]">
                Bs {money(cartTotal)}
              </p>
            </div>
            <Button
              type="button"
              className="h-12 min-w-[9rem] gap-2 bg-[#1e1e1e] hover:bg-[#2e2e2e]"
              onClick={() => setMobileCartOpen(true)}
              data-testid="pos-open-cart-sheet"
            >
              <ShoppingCart className="h-4 w-4" />
              Carrito ({cart.length})
            </Button>
          </div>
        </div>
      ) : null}

      {receipt ? (
        <PosReceipt
          data={receipt}
          onClose={() => setReceipt(null)}
          onNewSale={() => {
            setReceipt(null);
            setInfo(null);
          }}
        />
      ) : null}
    </div>
  );
}

export default function VentasPage() {
  return (
    <ProtectedRoute>
      <PosPageInner />
    </ProtectedRoute>
  );
}
