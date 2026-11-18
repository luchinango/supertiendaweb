import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
  CategoryStats,
  CategoryTreeNode,
} from '../../types/categoryTypes';
import { PaginationParams } from '../../types/pagination';

export interface ICategoryRepository {
  findById(id: number, businessId: number): Promise<CategoryResponse | null>;
  findMany(
    paginationParams: PaginationParams,
    businessId: number,
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

  findByName(name: string, businessId: number, excludeId?: number): Promise<CategoryResponse | null>;
  findChildren(parentId: number, businessId: number): Promise<CategoryResponse[]>;
  findParents(categoryId: number): Promise<CategoryResponse[]>;
  findTree(businessId: number): Promise<CategoryTreeNode[]>;
  findWithProductCount(businessId: number): Promise<CategoryResponse[]>;

  activate(id: number): Promise<CategoryResponse>;
  deactivate(id: number): Promise<CategoryResponse>;

  getStats(businessId: number): Promise<CategoryStats>;

  hasProducts(id: number): Promise<boolean>;
  hasChildren(id: number): Promise<boolean>;
  isValidParent(parentId: number, childId: number): Promise<boolean>;
}
