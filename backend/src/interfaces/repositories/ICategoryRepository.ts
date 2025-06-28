import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest, CategoryListResponse, CategoryStats, CategoryTreeNode } from '../../types/categoryTypes';
import { PaginationParams } from '../../types/pagination';

export interface ICategoryRepository {
  findById(id: number): Promise<CategoryResponse | null>;
  findMany(
    paginationParams: PaginationParams,
    additionalFilters?: {
      isActive?: boolean;
      parentId?: number;
      hasProducts?: boolean;
      search?: string;
    }
  ): Promise<CategoryListResponse>;
  create(data: CreateCategoryRequest): Promise<CategoryResponse>;
  update(id: number, data: UpdateCategoryRequest): Promise<CategoryResponse>;
  delete(id: number): Promise<void>;

  findByName(name: string, excludeId?: number): Promise<CategoryResponse | null>;
  findChildren(parentId: number): Promise<CategoryResponse[]>;
  findParents(categoryId: number): Promise<CategoryResponse[]>;
  findTree(): Promise<CategoryTreeNode[]>;
  findWithProductCount(): Promise<CategoryResponse[]>;

  activate(id: number): Promise<CategoryResponse>;
  deactivate(id: number): Promise<CategoryResponse>;

  getStats(): Promise<CategoryStats>;

  hasProducts(id: number): Promise<boolean>;
  hasChildren(id: number): Promise<boolean>;
  isValidParent(parentId: number, childId: number): Promise<boolean>;
}
