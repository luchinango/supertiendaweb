import {
  BusinessProductResponse,
  CreateBusinessProductRequest,
  UpdateBusinessProductRequest,
  BusinessProductListResponse,
  BusinessProductStats,
  BusinessProductSearchResponse,
  StockAdjustmentRequest,
  RestockRequest
} from '../../types/api';
import { PaginationParams } from '../../types/pagination';

export interface IBusinessProductService {
  findById(id: number): Promise<BusinessProductResponse | null>;
  findByBusinessAndProduct(businessId: number, productId: number): Promise<BusinessProductResponse | null>;
  findMany(
    paginationParams: PaginationParams,
    additionalFilters?: {
      businessId?: number;
      productId?: number;
      minStock?: number;
      maxStock?: number;
      minPrice?: number;
      maxPrice?: number;
      categoryId?: number;
      brand?: string;
      lowStock?: boolean;
      outOfStock?: boolean;
    }
  ): Promise<BusinessProductListResponse>;
  create(data: CreateBusinessProductRequest): Promise<BusinessProductResponse>;
  update(id: number, data: UpdateBusinessProductRequest): Promise<BusinessProductResponse>;
  updateByBusinessAndProduct(businessId: number, productId: number, data: UpdateBusinessProductRequest): Promise<BusinessProductResponse>;
  delete(id: number): Promise<void>;
  deleteByBusinessAndProduct(businessId: number, productId: number): Promise<void>;

  search(query: string, businessId?: number): Promise<BusinessProductSearchResponse>;

  findByBusiness(businessId: number): Promise<BusinessProductResponse[]>;
  findByProduct(productId: number): Promise<BusinessProductResponse[]>;
  findLowStock(businessId: number, threshold?: number): Promise<BusinessProductResponse[]>;
  findOutOfStock(businessId: number): Promise<BusinessProductResponse[]>;
  findByCategory(categoryId: number, businessId?: number): Promise<BusinessProductResponse[]>;
  findByBrand(brand: string, businessId?: number): Promise<BusinessProductResponse[]>;
  findRecentlyRestocked(businessId: number, days?: number): Promise<BusinessProductResponse[]>;

  adjustStock(id: number, adjustment: StockAdjustmentRequest): Promise<BusinessProductResponse>;
  restock(id: number, restockData: RestockRequest): Promise<BusinessProductResponse>;

  getStats(businessId: number): Promise<BusinessProductStats>;

  exists(businessId: number, productId: number): Promise<boolean>;
}
