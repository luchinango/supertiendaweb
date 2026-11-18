import { ICategoryService } from '../interfaces/services/ICategoryService';
import { ICategoryRepository } from '../interfaces/repositories/ICategoryRepository';
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
  CategoryStats,
  CategoryTreeNode,
} from '../types/categoryTypes';
import { PaginationParams } from '../types/pagination';
import { NotFoundError, ValidationError } from '../errors';
import { rejectCatalogMasterMutation } from '../helpers/catalogContainment';

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async findById(id: number, businessId: number): Promise<CategoryResponse | null> {
    if (!id || id <= 0) {
      throw new ValidationError('El ID de la categoría es requerido y debe ser válido');
    }

    return await this.categoryRepository.findById(id, businessId);
  }

  async findMany(
    paginationParams: PaginationParams,
    businessId: number,
    additionalFilters?: {
      isActive?: boolean;
      parentId?: number;
      hasProducts?: boolean;
      search?: string;
    }
  ): Promise<CategoryListResponse> {
    return await this.categoryRepository.findMany(paginationParams, businessId, additionalFilters);
  }

  async create(_data: CreateCategoryRequest): Promise<CategoryResponse> {
    rejectCatalogMasterMutation();
  }

  async update(_id: number, _data: UpdateCategoryRequest): Promise<CategoryResponse> {
    rejectCatalogMasterMutation();
  }

  async delete(_id: number): Promise<void> {
    rejectCatalogMasterMutation();
  }

  async findByName(name: string, businessId: number, excludeId?: number): Promise<CategoryResponse | null> {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('El nombre de la categoría es requerido');
    }

    return await this.categoryRepository.findByName(name.trim(), businessId, excludeId);
  }

  async findChildren(parentId: number, businessId: number): Promise<CategoryResponse[]> {
    if (!parentId || parentId <= 0) {
      throw new ValidationError('El ID de la categoría padre es requerido y debe ser válido');
    }

    const parent = await this.categoryRepository.findById(parentId, businessId);
    if (!parent) {
      throw new NotFoundError('Categoría padre no encontrada');
    }

    return await this.categoryRepository.findChildren(parentId, businessId);
  }

  async findTree(businessId: number): Promise<CategoryTreeNode[]> {
    return await this.categoryRepository.findTree(businessId);
  }

  async activate(_id: number): Promise<CategoryResponse> {
    rejectCatalogMasterMutation();
  }

  async deactivate(_id: number): Promise<CategoryResponse> {
    rejectCatalogMasterMutation();
  }

  async getStats(businessId: number): Promise<CategoryStats> {
    return await this.categoryRepository.getStats(businessId);
  }
}
