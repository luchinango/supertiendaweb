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
import { ValidationError, NotFoundError, ConflictError } from '../errors';

export class ProductService implements IProductService {
  constructor(private productRepository: IProductRepository) {}

  async findById(id: number): Promise<ProductResponse | null> {
    return await this.productRepository.findById(id);
  }

  async findMany(
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
  ): Promise<ProductListResponse> {
    return await this.productRepository.findMany(paginationParams, additionalFilters);
  }

  async create(data: CreateProductRequest, businessId: number): Promise<ProductResponse> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('El nombre del producto es requerido');
    }

    if (data.costPrice < 0) {
      throw new ValidationError('El precio de costo no puede ser negativo');
    }

    if (data.sellingPrice < 0) {
      throw new ValidationError('El precio de venta no puede ser negativo');
    }

    if (data.sellingPrice < data.costPrice) {
      throw new ValidationError('El precio de venta no puede ser menor al precio de costo');
    }

    if (data.sku) {
      const existingSku = await this.productRepository.existsBySku(data.sku, businessId);
      if (existingSku) {
        throw new ConflictError(`Ya existe un producto con el SKU: ${data.sku}`);
      }
    }

    if (data.barcode) {
      const existingBarcode = await this.productRepository.existsByBarcode(data.barcode, businessId);
      if (existingBarcode) {
        throw new ConflictError(`Ya existe un producto con el código de barras: ${data.barcode}`);
      }
    }

    return await this.productRepository.create(data, businessId);
  }

  async update(id: number, data: UpdateProductRequest): Promise<ProductResponse> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError('Producto no encontrado');
    }

    if (data.name !== undefined && (!data.name || data.name.trim().length === 0)) {
      throw new ValidationError('El nombre del producto es requerido');
    }

    if (data.costPrice !== undefined && data.costPrice < 0) {
      throw new ValidationError('El precio de costo no puede ser negativo');
    }

    if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
      throw new ValidationError('El precio de venta no puede ser negativo');
    }

    if (data.costPrice !== undefined && data.sellingPrice !== undefined) {
      if (data.sellingPrice < data.costPrice) {
        throw new ValidationError('El precio de venta no puede ser menor al precio de costo');
      }
    }

    if (data.sku && data.sku !== existingProduct.sku) {
      const existingSku = await this.productRepository.existsBySku(data.sku, 1, id); // TODO: get businessId from context
      if (existingSku) {
        throw new ConflictError(`Ya existe un producto con el SKU: ${data.sku}`);
      }
    }

    if (data.barcode && data.barcode !== existingProduct.barcode) {
      const existingBarcode = await this.productRepository.existsByBarcode(data.barcode, 1, id); // TODO: get businessId from context
      if (existingBarcode) {
        throw new ConflictError(`Ya existe un producto con el código de barras: ${data.barcode}`);
      }
    }

    return await this.productRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError('Producto no encontrado');
    }

    await this.productRepository.delete(id);
  }

  async search(query: string, businessId: number): Promise<ProductSearchResult[]> {
    if (!query || query.trim().length < 2) {
      throw new ValidationError('El término de búsqueda debe tener al menos 2 caracteres');
    }

    return await this.productRepository.search(query.trim(), businessId);
  }

  async activate(id: number): Promise<ProductResponse> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError('Producto no encontrado');
    }

    return await this.productRepository.update(id, {
      status: 'ACTIVE',
      isActive: true
    });
  }

  async deactivate(id: number): Promise<ProductResponse> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError('Producto no encontrado');
    }

    return await this.productRepository.update(id, {
      status: 'INACTIVE',
      isActive: false
    });
  }

  async discontinue(id: number): Promise<ProductResponse> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError('Producto no encontrado');
    }

    return await this.productRepository.update(id, {
      status: 'DISCONTINUED',
      isActive: false
    });
  }

  async markOutOfStock(id: number): Promise<ProductResponse> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError('Producto no encontrado');
    }

    return await this.productRepository.update(id, {
      status: 'OUT_OF_STOCK'
    });
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
