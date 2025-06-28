import useSWR from "swr";
import type { Supplier } from "@/types/types";
import type { ApiError, PaginationOptions } from "@/types/Api";
import {
  getSuppliers,
  getSuppliersPaginated,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSuppliersWithDebt,
  getSuppliersStats,
  getActiveSuppliers
} from "@/services/suppliersService";
import { useMemo, useCallback } from "react";

interface SuppliersStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  totalDebt: number;
  suppliersWithDebt: number;
}

interface UseSuppliersOptions extends PaginationOptions {
  enabled?: boolean;
  refreshInterval?: number;
  activeOnly?: boolean;
}

export function useSuppliers(options: UseSuppliersOptions = {}) {
  const { enabled = true, refreshInterval, activeOnly, ...paginationOptions } = options;

  const key = useMemo(() => {
    if (!enabled) return null;

    const keyParts = ['suppliers'];
    if (activeOnly) keyParts.push('active');
    if (paginationOptions.page) keyParts.push(`page-${paginationOptions.page}`);
    if (paginationOptions.limit) keyParts.push(`limit-${paginationOptions.limit}`);
    if (paginationOptions.search) keyParts.push(`search-${paginationOptions.search}`);

    return keyParts.join('-');
  }, [enabled, activeOnly, paginationOptions]);

  const fetcher = useCallback(() => {
    if (activeOnly) {
      return getActiveSuppliers(paginationOptions);
    }

    if (paginationOptions.page || paginationOptions.limit) {
      return getSuppliersPaginated(paginationOptions.page, paginationOptions.limit).then(response => response.data);
    }

    return getSuppliers();
  }, [activeOnly, paginationOptions]);

  const { data, error, isLoading, mutate } = useSWR<Supplier[]>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      refreshInterval,
    }
  );

  const suppliers = useMemo(() => data || [], [data]);

  const addSupplier = useCallback(async (supplier: Partial<Supplier>): Promise<Supplier> => {
    try {
      const created = await createSupplier(supplier);
      mutate((currentData) => currentData ? [...currentData, created] : [created], false);
      return created;
    } catch (error) {
      console.error("Error adding supplier:", error);
      throw error;
    }
  }, [mutate]);

  const editSupplier = useCallback(async (id: number, updatedData: Partial<Supplier>): Promise<Supplier> => {
    try {
      const optimistic = data?.map((supplier) =>
        supplier.id === id ? { ...supplier, ...updatedData } : supplier
      );
      mutate(optimistic, false);
      const updated = await updateSupplier(id, updatedData);
      mutate();
      return updated;
    } catch (error) {
      console.error("Error updating supplier:", error);
      mutate();
      throw error;
    }
  }, [data, mutate]);

  const removeSupplier = useCallback(async (id: number): Promise<void> => {
    try {
      const optimistic = data?.filter((supplier) => supplier.id !== id);
      mutate(optimistic, false);
      await deleteSupplier(id);
      mutate();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      mutate();
      throw error;
    }
  }, [data, mutate]);

  const getSupplierById = useCallback((id: number): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  }, [suppliers]);

  const searchSuppliersByTerm = useCallback((searchTerm: string): Supplier[] => {
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers]);

  const getSuppliersWithDebtList = useCallback((): Supplier[] => {
    return suppliers.filter(supplier => supplier.hasDebt);
  }, [suppliers]);

  const getActiveSuppliersList = useCallback((): Supplier[] => {
    return suppliers.filter(supplier => supplier.status === 'active');
  }, [suppliers]);

  return {
    suppliers,
    error: error as ApiError | null,
    isLoading,
    mutate,
    addSupplier,
    editSupplier,
    removeSupplier,
    getSupplierById,
    searchSuppliersByTerm,
    getSuppliersWithDebtList,
    getActiveSuppliersList,
  };
}

export function useSuppliersPaginated(page: number = 1, limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `suppliers-paginated-${page}-${limit}`,
    () => getSuppliersPaginated(page, limit)
  );

  return {
    response: data,
    suppliers: data?.data || [],
    meta: data?.meta,
    error: error as ApiError | null,
    isLoading,
    mutate,
  };
}

export function useSuppliersStats() {
  const { data, error, isLoading, mutate } = useSWR<SuppliersStats>(
    'suppliers-stats',
    getSuppliersStats,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    stats: data,
    error: error as ApiError | null,
    isLoading,
    mutate,
  };
}

export function useSuppliersWithDebt() {
  const { data, error, isLoading, mutate } = useSWR<Supplier[]>(
    'suppliers-with-debt',
    getSuppliersWithDebt,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    suppliers: data || [],
    error: error as ApiError | null,
    isLoading,
    mutate,
  };
}
