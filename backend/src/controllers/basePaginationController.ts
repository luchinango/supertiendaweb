import { Controller } from 'tsoa';
import { PaginationParams, PaginatedResult } from '../types/pagination';
import { validatePaginationParams } from '../middlewares/paginationMiddleware';
import { ForbiddenError, UnauthorizedError, ValidationError } from '../errors';
import { ApiResponse, PaginatedApiResponse, PaginationMeta } from '../types/api';
import { createSuccessResponse, createPaginatedResponse, convertPaginatedResult } from '../helpers/responseHelpers';
import { resolveBusinessId } from '../helpers/tenantContext';
import { Request as ExpressRequest } from 'express';

/**
 * Controlador base para paginación que pueden extender otros controladores
 */
export abstract class BasePaginationController extends Controller {

  /**
   * Obtiene el businessId desde el JWT autenticado.
   * Un businessId provisto por el cliente solo se acepta si coincide con el token.
   */
  protected getBusinessId(providedBusinessId: number | undefined, request: ExpressRequest): number {
    return resolveBusinessId(request, providedBusinessId);
  }

  /**
   * Valida y procesa los parámetros de paginación
   */
  protected validatePagination(
    page?: number,
    limit?: number,
    search?: string,
    sortBy?: string,
    sortOrder?: string
  ): PaginationParams {
    const validation = validatePaginationParams(page, limit, search, sortBy, sortOrder);

    if (!validation.isValid) {
      this.setStatus(400);
      throw new ValidationError(`Parámetros inválidos: ${validation.errors.join(', ')}`);
    }

    return {
      page,
      limit,
      search,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    };
  }

  /**
   * Crea una respuesta estándar de éxito
   */
  protected createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return createSuccessResponse(data, message);
  }

  /**
   * Crea una respuesta paginada estándar usando PaginatedResult
   */
  protected createPaginatedResponse<T>(
    result: PaginatedResult<T>,
    message?: string
  ): PaginatedApiResponse<T> {
    return convertPaginatedResult(result);
  }

  /**
   * Crea una respuesta paginada estándar usando items y meta directamente
   */
  protected createPaginatedResponseDirect<T>(
    data: T[],
    meta: PaginationMeta,
    message?: string
  ): PaginatedApiResponse<T> {
    return createPaginatedResponse(data, meta, message);
  }

  /**
   * Construye parámetros de paginación validados
   */
  protected buildPaginationParams(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): PaginationParams {
    return this.validatePagination(
      params.page,
      params.limit,
      params.search,
      params.sortBy,
      params.sortOrder
    );
  }

  /**
   * Maneja errores de paginación de manera estándar
   */
  protected handlePaginationError(error: any): never {
    if (error instanceof ValidationError) {
      this.setStatus(400);
      throw error;
    }

    if (error instanceof UnauthorizedError) {
      this.setStatus(401);
      throw error;
    }

    if (error instanceof ForbiddenError) {
      this.setStatus(403);
      throw error;
    }

    this.setStatus(500);
    throw new Error('Error interno del servidor');
  }
}