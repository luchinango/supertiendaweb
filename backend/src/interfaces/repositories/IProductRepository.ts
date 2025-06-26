import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
  ProductStats,
  ProductSearchResult
} from '../../types/api';
import { PaginationParams } from '../../types/pagination';

export interface IProductRepository {
  findById(id: number): Promise<ProductResponse | null>;
  findMany(
    paginationParams: PaginationParams,
    additionalFilters?: {
      categoryId?: number;
      status?: string;
      isActive?: boolean;
      minStock?: number;
      maxStock?: number;
      minPrice?: number;
      maxPrice?: number;
      brand?: string;
      taxType?: string;
    }
  ): Promise<ProductListResponse>;
  create(data: CreateProductRequest, businessId: number): Promise<ProductResponse>;
  update(id: number, data: UpdateProductRequest): Promise<ProductResponse>;
  delete(id: number): Promise<void>;

  search(query: string, businessId: number): Promise<ProductSearchResult[]>;

  findByCategory(categoryId: number, businessId: number): Promise<ProductResponse[]>;
  findByStatus(status: string, businessId: number): Promise<ProductResponse[]>;
  findByBrand(brand: string, businessId: number): Promise<ProductResponse[]>;
  findLowStock(businessId: number): Promise<ProductResponse[]>;
  findOutOfStock(businessId: number): Promise<ProductResponse[]>;
  findBySku(sku: string, businessId: number): Promise<ProductResponse | null>;
  findByBarcode(barcode: string, businessId: number): Promise<ProductResponse | null>;

  getStats(businessId: number): Promise<ProductStats>;

  existsBySku(sku: string, businessId: number, excludeId?: number): Promise<boolean>;
  existsByBarcode(barcode: string, businessId: number, excludeId?: number): Promise<boolean>;
}
