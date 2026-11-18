import { IProductService } from '../interfaces/services/IProductService';
import { IProductRepository } from '../interfaces/repositories/IProductRepository';
import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
  ProductStats,
  ProductSearchResult
} from '../types/api';
import { PaginationParams } from '../types/pagination';
import { ValidationError } from '../errors';
import { rejectCatalogMasterMutation } from '../helpers/catalogContainment';

export class ProductService implements IProductService {
  constructor(private productRepository: IProductRepository) {}

  async findById(id: number, businessId: number): Promise<ProductResponse | null> {
    return await this.productRepository.findById(id, businessId);
  }

  async findMany(
    paginationParams: PaginationParams,
    businessId: number,
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
  ): Promise<ProductListResponse> {
    return await this.productRepository.findMany(paginationParams, businessId, additionalFilters);
  }

  async create(_data: CreateProductRequest, _businessId: number): Promise<ProductResponse> {
    rejectCatalogMasterMutation();
  }

  async update(_id: number, _data: UpdateProductRequest): Promise<ProductResponse> {
    rejectCatalogMasterMutation();
  }

  async delete(_id: number): Promise<void> {
    rejectCatalogMasterMutation();
  }

  async search(query: string, businessId: number): Promise<ProductSearchResult[]> {
    if (!query || query.trim().length < 2) {
      throw new ValidationError('El término de búsqueda debe tener al menos 2 caracteres');
    }

    return await this.productRepository.search(query.trim(), businessId);
  }

  async activate(_id: number): Promise<ProductResponse> {
    rejectCatalogMasterMutation();
  }

  async deactivate(_id: number): Promise<ProductResponse> {
    rejectCatalogMasterMutation();
  }

  async discontinue(_id: number): Promise<ProductResponse> {
    rejectCatalogMasterMutation();
  }

  async markOutOfStock(_id: number): Promise<ProductResponse> {
    rejectCatalogMasterMutation();
  }

  async findByCategory(categoryId: number, businessId: number): Promise<ProductResponse[]> {
    return await this.productRepository.findByCategory(categoryId, businessId);
  }

  async findByStatus(status: string, businessId: number): Promise<ProductResponse[]> {
    return await this.productRepository.findByStatus(status, businessId);
  }

  async findByBrand(brand: string, businessId: number): Promise<ProductResponse[]> {
    if (!brand || brand.trim().length === 0) {
      throw new ValidationError('La marca es requerida');
    }

    return await this.productRepository.findByBrand(brand.trim(), businessId);
  }

  async findLowStock(businessId: number): Promise<ProductResponse[]> {
    return await this.productRepository.findLowStock(businessId);
  }

  async findOutOfStock(businessId: number): Promise<ProductResponse[]> {
    return await this.productRepository.findOutOfStock(businessId);
  }

  async getStats(businessId: number): Promise<ProductStats> {
    return await this.productRepository.getStats(businessId);
  }

  async existsBySku(sku: string, businessId: number, excludeId?: number): Promise<boolean> {
    return await this.productRepository.existsBySku(sku, businessId, excludeId);
  }

  async existsByBarcode(barcode: string, businessId: number, excludeId?: number): Promise<boolean> {
    return await this.productRepository.existsByBarcode(barcode, businessId, excludeId);
  }
}
