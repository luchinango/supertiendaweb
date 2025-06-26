import { ApiResponse, ErrorResponse, PaginatedApiResponse, PaginationMeta } from '../types/api';
import { PaginatedResult } from '../types/pagination';

/**
 * Crear respuesta de éxito estándar
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Crear respuesta de éxito paginada estándar
 */
export function createPaginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  message?: string
): PaginatedApiResponse<T> {
  return {
    success: true,
    data,
    meta,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Crear respuesta de error estándar
 */
export function createErrorResponse(
  message: string,
  code?: string,
  details?: any,
  path?: string,
  method?: string
): ErrorResponse {
  return {
    status: 'error',
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
    path: path || '',
    method: method || '',
  };
}

/**
 * Convertir PaginatedResult al formato estándar
 */
export function convertPaginatedResult<T>(result: PaginatedResult<T>): PaginatedApiResponse<T> {
  return createPaginatedResponse(
    result.data,
    {
      total: result.meta.total,
      page: result.meta.page || 1,
      limit: result.meta.limit || 10,
      totalPages: result.meta.totalPages,
      hasNextPage: result.meta.hasNextPage,
      hasPrevPage: result.meta.hasPrevPage,
      nextPage: result.meta.nextPage,
      prevPage: result.meta.prevPage,
    }
  );
}

/**
 * Convertir BusinessListResponse al formato PaginatedResponse
 * @deprecated - Usar convertPaginatedResult en su lugar
 */
export function convertToPaginatedResponse<T>(result: any) {
  return {
    data: result.items || result.data || result,
    total: result.meta?.total || result.total || 0,
    page: result.meta?.page || result.page || 1,
    totalPages: result.meta?.totalPages || result.totalPages || 1,
    limit: result.meta?.limit || result.limit || 10,
  };
}
