import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
  ProductStats,
  ProductSearchResult
} from '../../types/api';
import { PaginationParams } from '../../types/pagination';

export interface IProductService {
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

  activate(id: number): Promise<ProductResponse>;
  deactivate(id: number): Promise<ProductResponse>;
  discontinue(id: number): Promise<ProductResponse>;
  markOutOfStock(id: number): Promise<ProductResponse>;

  findByCategory(categoryId: number, businessId: number): Promise<ProductResponse[]>;
  findByStatus(status: string, businessId: number): Promise<ProductResponse[]>;
  findByBrand(brand: string, businessId: number): Promise<ProductResponse[]>;
  findLowStock(businessId: number): Promise<ProductResponse[]>;
  findOutOfStock(businessId: number): Promise<ProductResponse[]>;

  getStats(businessId: number): Promise<ProductStats>;

  existsBySku(sku: string, businessId: number, excludeId?: number): Promise<boolean>;
  existsByBarcode(barcode: string, businessId: number, excludeId?: number): Promise<boolean>;
}
