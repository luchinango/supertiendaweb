import { fetcher } from "@/lib/fetcher";
import type { CatalogResponse, CatalogFilters } from "@/types/Product";

class CatalogService {
  private baseUrl = "/business-products/catalog";

  /**
   * Construye query string para el catálogo
   */
  private buildCatalogQuery(filters: CatalogFilters = {}): string {
    const params = new URLSearchParams();

    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId.toString());
    }
    if (filters.stockStatus) {
      params.append('stockStatus', filters.stockStatus);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.brand) {
      params.append('brand', filters.brand);
    }
    if (filters.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters.isConfigured !== undefined) {
      params.append('isConfigured', filters.isConfigured.toString());
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Obtiene el catálogo completo con filtros
   */
  async getCatalog(filters: CatalogFilters = {}): Promise<CatalogResponse> {
    const query = this.buildCatalogQuery(filters);
    const url = `${this.baseUrl}${query}`;

    console.log('🛒 Catalog URL:', url);
    console.log('📋 Filters:', filters);

    return fetcher<CatalogResponse>(url);
  }

  /**
   * Obtiene productos por categoría específica
   */
  async getCatalogByCategory(categoryId: number, filters: Omit<CatalogFilters, 'categoryId'> = {}): Promise<CatalogResponse> {
    const query = this.buildCatalogQuery({ ...filters, categoryId });
    return fetcher<CatalogResponse>(`${this.baseUrl}${query}`);
  }

  /**
   * Obtiene productos disponibles para venta (solo con stock)
   */
  async getAvailableProducts(filters: CatalogFilters = {}): Promise<CatalogResponse> {
    return this.getCatalog({ ...filters, stockStatus: 'IN_STOCK', isActive: true });
  }

  /**
   * Obtiene productos con stock bajo
   */
  async getLowStockProducts(filters: CatalogFilters = {}): Promise<CatalogResponse> {
    return this.getCatalog({ ...filters, stockStatus: 'LOW_STOCK' });
  }

  /**
   * Busca productos por término
   */
  async searchProducts(searchTerm: string, filters: CatalogFilters = {}): Promise<CatalogResponse> {
    return this.getCatalog({ ...filters, search: searchTerm });
  }

  /**
   * Obtiene productos por rango de precio
   */
  async getProductsByPriceRange(minPrice: number, maxPrice: number, filters: CatalogFilters = {}): Promise<CatalogResponse> {
    return this.getCatalog({ ...filters, minPrice, maxPrice });
  }
}

const catalogService = new CatalogService();

export const getCatalog = (filters?: CatalogFilters) => catalogService.getCatalog(filters);
export const getCatalogByCategory = (categoryId: number, filters?: Omit<CatalogFilters, 'categoryId'>) =>
  catalogService.getCatalogByCategory(categoryId, filters);
export const getAvailableProducts = (filters?: CatalogFilters) => catalogService.getAvailableProducts(filters);
export const getLowStockProducts = (filters?: CatalogFilters) => catalogService.getLowStockProducts(filters);
export const searchCatalogProducts = (searchTerm: string, filters?: CatalogFilters) =>
  catalogService.searchProducts(searchTerm, filters);
export const getProductsByPriceRange = (minPrice: number, maxPrice: number, filters?: CatalogFilters) =>
  catalogService.getProductsByPriceRange(minPrice, maxPrice, filters);

export { catalogService };
