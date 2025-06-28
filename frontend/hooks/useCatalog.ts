import useSWR from "swr";
import type { CatalogResponse, CatalogProduct, CatalogFilters } from "@/types/Product";
import type { ApiError } from "@/types/Api";
import {
  getCatalog,
  getCatalogByCategory,
  getAvailableProducts,
  getLowStockProducts,
  searchCatalogProducts,
  getProductsByPriceRange
} from "@/services/catalogService";
import { useMemo, useCallback } from "react";

interface UseCatalogOptions extends CatalogFilters {
  enabled?: boolean
  refreshInterval?: number
}

export function useCatalog(options: UseCatalogOptions = {}) {
  const { enabled = true, refreshInterval, ...filters } = options;

  const key = useMemo(() => {
    if (!enabled) return null;
    const filterKeys = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    return filterKeys ? `catalog-${filterKeys}` : 'catalog';
  }, [enabled, filters]);

  const { data, error, isLoading, mutate } = useSWR<CatalogResponse>(
    key,
    () => getCatalog(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      refreshInterval,
    }
  );

  const products = useMemo(() => data?.data?.items || [], [data]);
  const meta = useMemo(() => data?.data?.meta, [data]);
  const summary = useMemo(() => data?.data?.summary, [data]);

  const searchProducts = useCallback(async (searchTerm: string): Promise<CatalogProduct[]> => {
    try {
      const response = await searchCatalogProducts(searchTerm, filters);
      return response.data.items;
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }, [filters]);

  const getProductsByCategory = useCallback(async (categoryId: number): Promise<CatalogProduct[]> => {
    try {
      const response = await getCatalogByCategory(categoryId, filters);
      return response.data.items;
    } catch (error) {
      console.error("Error getting products by category:", error);
      throw error;
    }
  }, [filters]);

  const getAvailableProductsList = useCallback(async (): Promise<CatalogProduct[]> => {
    try {
      const response = await getAvailableProducts(filters);
      return response.data.items;
    } catch (error) {
      console.error("Error getting available products:", error);
      throw error;
    }
  }, [filters]);

  const getLowStockProductsList = useCallback(async (): Promise<CatalogProduct[]> => {
    try {
      const response = await getLowStockProducts(filters);
      return response.data.items;
    } catch (error) {
      console.error("Error getting low stock products:", error);
      throw error;
    }
  }, [filters]);

  const getProductsByPriceRangeList = useCallback(async (minPrice: number, maxPrice: number): Promise<CatalogProduct[]> => {
    try {
      const response = await getProductsByPriceRange(minPrice, maxPrice, filters);
      return response.data.items;
    } catch (error) {
      console.error("Error getting products by price range:", error);
      throw error;
    }
  }, [filters]);

  const getProductById = useCallback((id: number): CatalogProduct | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const getProductsByBrand = useCallback((brand: string): CatalogProduct[] => {
    return products.filter(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
  }, [products]);

  const getProductsByStatus = useCallback((status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'): CatalogProduct[] => {
    return products.filter(p => p.stockStatus === status);
  }, [products]);

  return {
    products,
    meta,
    summary,
    error: error as ApiError | null,
    isLoading,
    mutate,
    searchProducts,
    getProductsByCategory,
    getAvailableProductsList,
    getLowStockProductsList,
    getProductsByPriceRangeList,
    getProductById,
    getProductsByBrand,
    getProductsByStatus,
  };
}

export function useCatalogByCategory(categoryId: number, options: Omit<UseCatalogOptions, 'categoryId'> = {}) {
  return useCatalog({ ...options, categoryId });
}

export function useAvailableProducts(options: UseCatalogOptions = {}) {
  return useCatalog({ ...options, stockStatus: 'IN_STOCK', isActive: true });
}

export function useLowStockProducts(options: UseCatalogOptions = {}) {
  return useCatalog({ ...options, stockStatus: 'LOW_STOCK' });
}
