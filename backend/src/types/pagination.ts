/**
 * Tipos para el sistema de paginación estándar
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  maxLimit?: number;
  defaultLimit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationConfig {
  defaultLimit: number;
  maxLimit: number;
  defaultSortOrder: 'asc' | 'desc';
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationQuery {
  skip: number;
  take: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}