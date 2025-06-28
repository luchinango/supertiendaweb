import useSWR from "swr";
import type {Product} from "@/types/Product";
import type {ApiError} from "@/types/Api";
import {
  getProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} from "@/services/productsService";
import { useMemo, useCallback } from "react";

interface ProductsStats {
  total: number
  totalValue: number
  lowStock: number
  outOfStock: number
  expiringSoon: number
}

interface UseProductsOptions {
  categoryId?: number
  enabled?: boolean
  refreshInterval?: number
}

export function useProducts(options: UseProductsOptions = {}) {
  const { categoryId, enabled = true, refreshInterval } = options;

  const key = categoryId && categoryId !== 0 ? `products-category-${categoryId}` : "products";
  const fetcherFn = categoryId && categoryId !== 0 ? () => getProductsByCategory(categoryId) : getProducts;

  const {data, error, isLoading, mutate} = useSWR<Product[]>(
    enabled ? key : null,
    fetcherFn,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      refreshInterval,
    }
  );

  const products = useMemo(() => data || [], [data]);

  const addProduct = useCallback(async (product: Partial<Product>): Promise<Product> => {
    try {
      const created = await createProduct(product);
      mutate((currentData) => currentData ? [...currentData, created] : [created], false);
      return created;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  }, [mutate]);

  const editProduct = useCallback(async (id: number, updatedData: Partial<Product>): Promise<Product> => {
    try {
      const optimistic = data?.map((p) =>
        p.id === id ? {...p, ...updatedData} : p
      );
      mutate(optimistic, false);
      const updated = await updateProduct(id, updatedData);
      mutate();
      return updated;
    } catch (error) {
      console.error("Error updating product:", error);
      mutate();
      throw error;
    }
  }, [data, mutate]);

  const removeProduct = useCallback(async (id: number): Promise<void> => {
    try {
      const optimistic = data?.filter((p) => p.id !== id);
      mutate(optimistic, false);
      await deleteProduct(id);
      mutate();
    } catch (error) {
      console.error("Error deleting product:", error);
      mutate();
      throw error;
    }
  }, [data, mutate]);

  const stats = useMemo((): ProductsStats => {
    if (!products.length) return {
      total: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0,
      expiringSoon: 0
    };

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      total: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      lowStock: products.filter(p => p.stock <= p.min_stock && p.stock > 0).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      expiringSoon: products.filter(p => {
        if (!p.expiration_date) return false;
        const expirationDate = new Date(p.expiration_date);
        return expirationDate <= thirtyDaysFromNow && expirationDate >= now;
      }).length,
    };
  }, [products]);

  const getProductById = useCallback((id: number): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const getProductsByCategoryId = useCallback((categoryId: number): Product[] => {
    return products.filter(p => p.category_id === categoryId);
  }, [products]);

  const searchProducts = useCallback((searchTerm: string): Product[] => {
    const term = searchTerm.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.barcode?.includes(term) ||
      p.sku?.toLowerCase().includes(term)
    );
  }, [products]);

  return {
    products,
    error: error as ApiError | null,
    isLoading,
    mutate,
    addProduct,
    editProduct,
    removeProduct,
    stats,
    getProductById,
    getProductsByCategoryId,
    searchProducts,
  };
}
