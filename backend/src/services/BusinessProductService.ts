import { IBusinessProductService } from '../interfaces/services/IBusinessProductService';
import { IBusinessProductRepository } from '../interfaces/repositories/IBusinessProductRepository';
import {
  BusinessProductResponse,
  CreateBusinessProductRequest,
  UpdateBusinessProductRequest,
  BusinessProductListResponse,
  BusinessProductStats,
  StockAdjustmentRequest,
  RestockRequest,
  BusinessProductSearchResponse
} from '../types/api';
import { PaginationParams } from '../types/pagination';
import { ValidationError, NotFoundError, ConflictError } from '../errors';

export class BusinessProductService implements IBusinessProductService {
  constructor(private businessProductRepository: IBusinessProductRepository) {}

  async findById(id: number): Promise<BusinessProductResponse | null> {
    return await this.businessProductRepository.findById(id);
  }

  async findByBusinessAndProduct(businessId: number, productId: number): Promise<BusinessProductResponse | null> {
    return await this.businessProductRepository.findByBusinessAndProduct(businessId, productId);
  }

  async findMany(
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
  ): Promise<BusinessProductListResponse> {
    return await this.businessProductRepository.findMany(paginationParams, additionalFilters);
  }

  async create(data: CreateBusinessProductRequest): Promise<BusinessProductResponse> {
    if (!data.businessId || data.businessId <= 0) {
      throw new ValidationError('El ID del negocio es requerido y debe ser válido');
    }

    if (!data.productId || data.productId <= 0) {
      throw new ValidationError('El ID del producto es requerido y debe ser válido');
    }

    if (!data.customPrice || data.customPrice <= 0) {
      throw new ValidationError('El precio personalizado es requerido y debe ser mayor a 0');
    }

    if (data.currentStock !== undefined && data.currentStock < 0) {
      throw new ValidationError('El stock actual no puede ser negativo');
    }

    if (data.reservedStock !== undefined && data.reservedStock < 0) {
      throw new ValidationError('El stock reservado no puede ser negativo');
    }

    if (data.availableStock !== undefined && data.availableStock < 0) {
      throw new ValidationError('El stock disponible no puede ser negativo');
    }

    const existingBusinessProduct = await this.businessProductRepository.exists(data.businessId, data.productId);
    if (existingBusinessProduct) {
      throw new ConflictError('Este producto ya está asignado a este negocio');
    }

    return await this.businessProductRepository.create(data);
  }

  async update(id: number, data: UpdateBusinessProductRequest): Promise<BusinessProductResponse> {
    const existingBusinessProduct = await this.businessProductRepository.findById(id);
    if (!existingBusinessProduct) {
      throw new NotFoundError('Producto de negocio no encontrado');
    }

    if (data.customPrice !== undefined && data.customPrice <= 0) {
      throw new ValidationError('El precio personalizado debe ser mayor a 0');
    }

    if (data.currentStock !== undefined && data.currentStock < 0) {
      throw new ValidationError('El stock actual no puede ser negativo');
    }

    if (data.reservedStock !== undefined && data.reservedStock < 0) {
      throw new ValidationError('El stock reservado no puede ser negativo');
    }

    if (data.availableStock !== undefined && data.availableStock < 0) {
      throw new ValidationError('El stock disponible no puede ser negativo');
    }

    return await this.businessProductRepository.update(id, data);
  }

  async updateByBusinessAndProduct(
    businessId: number,
    productId: number,
    data: UpdateBusinessProductRequest
  ): Promise<BusinessProductResponse> {
    const existingBusinessProduct = await this.businessProductRepository.findByBusinessAndProduct(businessId, productId);
    if (!existingBusinessProduct) {
      throw new NotFoundError('Producto de negocio no encontrado');
    }

    if (data.customPrice !== undefined && data.customPrice <= 0) {
      throw new ValidationError('El precio personalizado debe ser mayor a 0');
    }

    if (data.currentStock !== undefined && data.currentStock < 0) {
      throw new ValidationError('El stock actual no puede ser negativo');
    }

    if (data.reservedStock !== undefined && data.reservedStock < 0) {
      throw new ValidationError('El stock reservado no puede ser negativo');
    }

    if (data.availableStock !== undefined && data.availableStock < 0) {
      throw new ValidationError('El stock disponible no puede ser negativo');
    }

    return await this.businessProductRepository.updateByBusinessAndProduct(businessId, productId, data);
  }

  async delete(id: number): Promise<void> {
    const existingBusinessProduct = await this.businessProductRepository.findById(id);
    if (!existingBusinessProduct) {
      throw new NotFoundError('Producto de negocio no encontrado');
    }

    await this.businessProductRepository.delete(id);
  }

  async deleteByBusinessAndProduct(businessId: number, productId: number): Promise<void> {
    const existingBusinessProduct = await this.businessProductRepository.findByBusinessAndProduct(businessId, productId);
    if (!existingBusinessProduct) {
      throw new NotFoundError('Producto de negocio no encontrado');
    }

    await this.businessProductRepository.deleteByBusinessAndProduct(businessId, productId);
  }

  async search(query: string, businessId?: number): Promise<BusinessProductSearchResponse> {
    if (!query || query.trim().length < 2) {
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null
        }
      };
    }

    const results = await this.businessProductRepository.search(query.trim(), businessId);

    return {
      data: results,
      meta: {
        total: results.length,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
      }
    };
  }

  async findByBusiness(businessId: number): Promise<BusinessProductResponse[]> {
    if (!businessId || businessId <= 0) {
      throw new ValidationError('El ID del negocio es requerido y debe ser válido');
    }

    return await this.businessProductRepository.findByBusiness(businessId);
  }

  async findByProduct(productId: number): Promise<BusinessProductResponse[]> {
    if (!productId || productId <= 0) {
      throw new ValidationError('El ID del producto es requerido y debe ser válido');
    }

    return await this.businessProductRepository.findByProduct(productId);
  }

  async findLowStock(businessId: number, threshold?: number): Promise<BusinessProductResponse[]> {
    if (!businessId || businessId <= 0) {
      throw new ValidationError('El ID del negocio es requerido y debe ser válido');
    }

    if (threshold !== undefined && threshold < 0) {
      throw new ValidationError('El umbral de stock bajo no puede ser negativo');
    }

    return await this.businessProductRepository.findLowStock(businessId, threshold);
  }

  async findOutOfStock(businessId: number): Promise<BusinessProductResponse[]> {
    if (!businessId || businessId <= 0) {
      throw new ValidationError('El ID del negocio es requerido y debe ser válido');
    }

    return await this.businessProductRepository.findOutOfStock(businessId);
  }

  async findByCategory(categoryId: number, businessId?: number): Promise<BusinessProductResponse[]> {
    if (!categoryId || categoryId <= 0) {
      throw new ValidationError('El ID de la categoría es requerido y debe ser válido');
    }

    if (businessId !== undefined && businessId <= 0) {
      throw new ValidationError('El ID del negocio debe ser válido');
    }

    return await this.businessProductRepository.findByCategory(categoryId, businessId);
  }

  async findByBrand(brand: string, businessId?: number): Promise<BusinessProductResponse[]> {
    if (!brand || brand.trim().length === 0) {
      throw new ValidationError('La marca es requerida');
    }

    if (businessId !== undefined && businessId <= 0) {
      throw new ValidationError('El ID del negocio debe ser válido');
    }

    return await this.businessProductRepository.findByBrand(brand.trim(), businessId);
  }

  async findRecentlyRestocked(businessId: number, days?: number): Promise<BusinessProductResponse[]> {
    if (!businessId || businessId <= 0) {
      throw new ValidationError('El ID del negocio es requerido y debe ser válido');
    }

    if (days !== undefined && days <= 0) {
      throw new ValidationError('El número de días debe ser mayor a 0');
    }

    return await this.businessProductRepository.findRecentlyRestocked(businessId, days);
  }

  async adjustStock(id: number, adjustment: StockAdjustmentRequest): Promise<BusinessProductResponse> {
    const existingBusinessProduct = await this.businessProductRepository.findById(id);
    if (!existingBusinessProduct) {
      throw new NotFoundError('Producto de negocio no encontrado');
    }

    if (!adjustment.reason || adjustment.reason.trim().length === 0) {
      throw new ValidationError('La razón del ajuste de stock es requerida');
    }

    if (adjustment.quantity === 0) {
      throw new ValidationError('La cantidad de ajuste no puede ser cero');
    }

    if (adjustment.quantity < 0) {
      const newStock = existingBusinessProduct.currentStock + adjustment.quantity;
      if (newStock < 0) {
        throw new ValidationError('El ajuste resultaría en stock negativo');
      }
    }

    return await this.businessProductRepository.adjustStock(id, adjustment);
  }

  async restock(id: number, restockData: RestockRequest): Promise<BusinessProductResponse> {
    const existingBusinessProduct = await this.businessProductRepository.findById(id);
    if (!existingBusinessProduct) {
      throw new NotFoundError('Producto de negocio no encontrado');
    }

    if (!restockData.quantity || restockData.quantity <= 0) {
      throw new ValidationError('La cantidad de restock debe ser mayor a 0');
    }

    if (restockData.unitCost !== undefined && restockData.unitCost < 0) {
      throw new ValidationError('El costo unitario no puede ser negativo');
    }

    return await this.businessProductRepository.restock(id, restockData);
  }

  async getStats(businessId: number): Promise<BusinessProductStats> {
    if (!businessId || businessId <= 0) {
      throw new ValidationError('El ID del negocio es requerido y debe ser válido');
    }

    return await this.businessProductRepository.getStats(businessId);
  }

  async exists(businessId: number, productId: number): Promise<boolean> {
    if (!businessId || businessId <= 0) {
      throw new ValidationError('El ID del negocio es requerido y debe ser válido');
    }

    if (!productId || productId <= 0) {
      throw new ValidationError('El ID del producto es requerido y debe ser válido');
    }

    return await this.businessProductRepository.exists(businessId, productId);
  }
}
