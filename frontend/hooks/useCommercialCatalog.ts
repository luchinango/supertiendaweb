'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  createScope,
  getOrCreateDeviceId,
  runCatalogSyncCycle,
  subscribeSyncEvents,
} from '@/lib/offline';
import { getAuthToken, getBusinessId } from '@/lib/auth-utils';
import {
  adoptSharedProduct,
  createPrivateCategory,
  createPrivateProduct,
  listAdoptableShared,
  listCommercialCatalog,
  listLocalCategories,
  adjustStock,
  revisePendingPrivateProduct,
  updateCommercialPrice,
  updatePrivateCategory,
  updatePrivateProduct,
} from '@/lib/catalog/commercialCatalogService';
import type {
  AdoptSharedInput,
  CatalogVisibilityFilter,
  CommercialCatalogRow,
  CreatePrivateCategoryInput,
  CreatePrivateProductInput,
  StockAdjustInput,
  UpdatePrivateCategoryInput,
  UpdatePrivateProductInput,
} from '@/lib/catalog/commercialTypes';
import { getConnectionStatus, subscribeConnection } from '@/lib/offline/connectivity';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://127.0.0.1:5000';

export function useCommercialCatalog() {
  const { user } = useAuth();
  const [rows, setRows] = useState<CommercialCatalogRow[]>([]);
  const [categories, setCategories] = useState<
    Awaited<ReturnType<typeof listLocalCategories>>
  >([]);
  const [adoptable, setAdoptable] = useState<Awaited<ReturnType<typeof listAdoptableShared>>>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState<CatalogVisibilityFilter>('all');
  const [connection, setConnection] = useState(getConnectionStatus());

  const scope = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (!user?.id || user.businessId == null) return null;
    try {
      return createScope(Number(user.id), Number(user.businessId), getOrCreateDeviceId());
    } catch {
      return null;
    }
  }, [user?.id, user?.businessId]);

  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE' || user?.role === 'ADMIN';

  const reload = useCallback(async () => {
    if (!scope) {
      setRows([]);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [list, cats, adopt] = await Promise.all([
        listCommercialCatalog(scope, { search, visibility }),
        listLocalCategories(scope),
        listAdoptableShared(scope),
      ]);
      setRows(list);
      setCategories(cats);
      setAdoptable(adopt);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [scope, search, visibility]);

  const syncNow = useCallback(async () => {
    if (!scope) return;
    const token = getAuthToken();
    const bid = getBusinessId();
    if (!token || bid == null) {
      setError('Sesión requerida para sincronizar');
      return;
    }
    setSyncing(true);
    setError(null);
    try {
      await runCatalogSyncCycle({
        scope,
        accessToken: token,
        tokenBusinessId: bid,
        apiBase: API_BASE,
      });
      await reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSyncing(false);
    }
  }, [scope, reload]);

  useEffect(() => {
    setConnection(getConnectionStatus());
    return subscribeConnection(setConnection);
  }, []);

  useEffect(() => {
    setLoading(true);
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!scope) return;
    // Primera carga: sync si hay red
    if (getConnectionStatus() === 'online') {
      void syncNow();
    }
    return subscribeSyncEvents(scope, () => {
      void reload();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar scope
  }, [scope?.userId, scope?.businessId, scope?.deviceId]);

  const createProduct = useCallback(
    async (input: CreatePrivateProductInput) => {
      if (!scope || !isAdmin) throw new Error('Solo ADMIN puede crear productos');
      const op = await createPrivateProduct(scope, input);
      await reload();
      if (getConnectionStatus() === 'online') void syncNow();
      return op;
    },
    [scope, isAdmin, reload, syncNow]
  );

  const editProduct = useCallback(
    async (input: UpdatePrivateProductInput) => {
      if (!scope || !isAdmin) throw new Error('Solo ADMIN puede editar productos');
      const op = await updatePrivateProduct(scope, input);
      await reload();
      if (getConnectionStatus() === 'online') void syncNow();
      return op;
    },
    [scope, isAdmin, reload, syncNow]
  );

  const createCategory = useCallback(
    async (input: CreatePrivateCategoryInput) => {
      if (!scope || !isAdmin) throw new Error('Solo ADMIN puede crear categorías');
      const op = await createPrivateCategory(scope, input);
      await reload();
      if (getConnectionStatus() === 'online') void syncNow();
      return op;
    },
    [scope, isAdmin, reload, syncNow]
  );

  const editCategory = useCallback(
    async (input: UpdatePrivateCategoryInput) => {
      if (!scope || !isAdmin) throw new Error('Solo ADMIN puede editar categorías');
      const op = await updatePrivateCategory(scope, input);
      await reload();
      if (getConnectionStatus() === 'online') void syncNow();
      return op;
    },
    [scope, isAdmin, reload, syncNow]
  );

  const adopt = useCallback(
    async (input: AdoptSharedInput) => {
      if (!scope || !isAdmin) throw new Error('Solo ADMIN puede adoptar productos');
      const op = await adoptSharedProduct(scope, input);
      await reload();
      if (getConnectionStatus() === 'online') void syncNow();
      return op;
    },
    [scope, isAdmin, reload, syncNow]
  );

  const setPrice = useCallback(
    async (opts: {
      productServerId: number;
      customPrice: number;
      baseVersion: number;
      bpLocalId?: string;
    }) => {
      if (!scope || !isAdmin) throw new Error('Solo ADMIN puede cambiar precio');
      const op = await updateCommercialPrice(scope, opts);
      await reload();
      if (getConnectionStatus() === 'online') void syncNow();
      return op;
    },
    [scope, isAdmin, reload, syncNow]
  );

  const revisePending = useCallback(
    async (input: {
      productLocalId: string;
      name?: string;
      sku?: string | null;
      categoryServerId?: number;
      customPrice?: number;
    }) => {
      if (!scope || !isAdmin) throw new Error('Solo ADMIN puede editar productos');
      const id = await revisePendingPrivateProduct(scope, input);
      await reload();
      if (getConnectionStatus() === 'online') void syncNow();
      return id;
    },
    [scope, isAdmin, reload, syncNow]
  );

  /** STOCK_ADJUST: ADMIN y EMPLOYEE (mismo backend SyncService). */
  const canAdjustStock = !!isEmployee;

  const adjust = useCallback(
    async (input: StockAdjustInput) => {
      if (!scope || !canAdjustStock) throw new Error('Sin permiso para ajustar stock');
      const op = await adjustStock(scope, input);
      await reload();
      if (getConnectionStatus() === 'online') void syncNow();
      return op;
    },
    [scope, canAdjustStock, reload, syncNow]
  );

  return {
    scope,
    user,
    isAdmin,
    canRead: !!isEmployee,
    canAdjustStock,
    rows,
    categories,
    adoptable,
    loading,
    syncing,
    error,
    search,
    setSearch,
    visibility,
    setVisibility,
    connection,
    reload,
    syncNow,
    createProduct,
    editProduct,
    createCategory,
    editCategory,
    adopt,
    setPrice,
    revisePending,
    adjust,
  };
}
