import { Category } from '../../prisma/generated';
import { PaginationMeta } from './pagination';

export interface CategoryResponse extends Category {
  productCount?: number;
  children?: CategoryResponse[];
  parent?: CategoryResponse;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CategoryListResponse {
  items: CategoryResponse[];
  meta: PaginationMeta;
}

export interface CategoryWithHierarchy extends CategoryResponse {
  level: number;
  path: string;
  hasChildren: boolean;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categoriesWithProducts: number;
  averageProductsPerCategory: number;
  topCategoriesByProducts: {
    id: number;
    name: string;
    productCount: number;
  }[];
}

export interface CategoryErrorResponse {
  success: false;
  message: string;
  error?: string;
  timestamp: string;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  children: CategoryTreeNode[];
}