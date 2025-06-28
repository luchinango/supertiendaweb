import { ICategoryService } from '../interfaces/services/ICategoryService';
import { ICategoryRepository } from '../interfaces/repositories/ICategoryRepository';
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest, CategoryListResponse, CategoryStats, CategoryTreeNode } from '../types/categoryTypes';
import { PaginationParams } from '../types/pagination';
import { NotFoundError, ValidationError } from '../errors';
import { BusinessError } from '../utils/errors';

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async findById(id: number): Promise<CategoryResponse | null> {
    if (!id || id <= 0) {
      throw new ValidationError('El ID de la categoría es requerido y debe ser válido');
    }

    return await this.categoryRepository.findById(id);
  }

  async findMany(
    paginationParams: PaginationParams,
    additionalFilters?: {
      isActive?: boolean;
      parentId?: number;
      hasProducts?: boolean;
      search?: string;
    }
  ): Promise<CategoryListResponse> {
    return await this.categoryRepository.findMany(paginationParams, additionalFilters);
  }

  async create(data: CreateCategoryRequest): Promise<CategoryResponse> {
    await this.validateCreate(data);
    return await this.categoryRepository.create(data);
  }

  async update(id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> {
    await this.validateUpdate(id, data);
    return await this.categoryRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.validateDelete(id);
    await this.categoryRepository.delete(id);
  }

  async findByName(name: string, excludeId?: number): Promise<CategoryResponse | null> {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('El nombre de la categoría es requerido');
    }

    return await this.categoryRepository.findByName(name.trim(), excludeId);
  }

  async findChildren(parentId: number): Promise<CategoryResponse[]> {
    if (!parentId || parentId <= 0) {
      throw new ValidationError('El ID de la categoría padre es requerido y debe ser válido');
    }

    const parent = await this.categoryRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundError('Categoría padre no encontrada');
    }

    return await this.categoryRepository.findChildren(parentId);
  }

  async findTree(): Promise<CategoryTreeNode[]> {
    return await this.categoryRepository.findTree();
  }

  async activate(id: number): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    if (category.isActive) {
      throw new BusinessError('La categoría ya está activa');
    }

    return await this.categoryRepository.activate(id);
  }

  async deactivate(id: number): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    if (!category.isActive) {
      throw new BusinessError('La categoría ya está inactiva');
    }

    const hasProducts = await this.categoryRepository.hasProducts(id);
    if (hasProducts) {
      throw new BusinessError('No se puede desactivar una categoría que tiene productos asociados');
    }

    return await this.categoryRepository.deactivate(id);
  }

  async getStats(): Promise<CategoryStats> {
    return await this.categoryRepository.getStats();
  }

  async validateCreate(data: CreateCategoryRequest): Promise<void> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('El nombre de la categoría es requerido');
    }

    if (data.name.trim().length < 2) {
      throw new ValidationError('El nombre de la categoría debe tener al menos 2 caracteres');
    }

    if (data.name.trim().length > 100) {
      throw new ValidationError('El nombre de la categoría no puede exceder 100 caracteres');
    }

    const existingCategory = await this.categoryRepository.findByName(data.name.trim());
    if (existingCategory) {
      throw new ValidationError('Ya existe una categoría con ese nombre');
    }

    if (data.parentId) {
      const parent = await this.categoryRepository.findById(data.parentId);
      if (!parent) {
        throw new ValidationError('La categoría padre especificada no existe');
      }

      if (!parent.isActive) {
        throw new ValidationError('La categoría padre debe estar activa');
      }
    }

    if (data.description && data.description.length > 500) {
      throw new ValidationError('La descripción no puede exceder 500 caracteres');
    }

    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      throw new ValidationError('El orden de clasificación debe ser un número positivo');
    }
  }

  async validateUpdate(id: number, data: UpdateCategoryRequest): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('El nombre de la categoría es requerido');
      }

      if (data.name.trim().length < 2) {
        throw new ValidationError('El nombre de la categoría debe tener al menos 2 caracteres');
      }

      if (data.name.trim().length > 100) {
        throw new ValidationError('El nombre de la categoría no puede exceder 100 caracteres');
      }

      const existingCategory = await this.categoryRepository.findByName(data.name.trim(), id);
      if (existingCategory) {
        throw new ValidationError('Ya existe una categoría con ese nombre');
      }
    }

    if (data.parentId !== undefined) {
      if (data.parentId === null) {
      } else {
        const parent = await this.categoryRepository.findById(data.parentId);
        if (!parent) {
          throw new ValidationError('La categoría padre especificada no existe');
        }

        if (!parent.isActive) {
          throw new ValidationError('La categoría padre debe estar activa');
        }

        const isValidParent = await this.categoryRepository.isValidParent(data.parentId, id);
        if (!isValidParent) {
          throw new ValidationError('La categoría padre especificada crearía una referencia circular');
        }
      }
    }

    if (data.description !== undefined && data.description && data.description.length > 500) {
      throw new ValidationError('La descripción no puede exceder 500 caracteres');
    }

    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      throw new ValidationError('El orden de clasificación debe ser un número positivo');
    }
  }

  async validateDelete(id: number): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    const hasProducts = await this.categoryRepository.hasProducts(id);
    if (hasProducts) {
      throw new BusinessError('No se puede eliminar una categoría que tiene productos asociados');
    }

    const hasChildren = await this.categoryRepository.hasChildren(id);
    if (hasChildren) {
      throw new BusinessError('No se puede eliminar una categoría que tiene subcategorías');
    }
  }
}
