import { PrismaClient } from '../../prisma/generated';
import {
  PaginationParams,
  PaginationOptions,
  PaginatedResult,
  PaginationQuery
} from '../types/pagination';
import {
  processPaginationParams,
  buildPaginationQuery,
  createPaginatedResult,
  buildSearchFilter
} from '../utils/pagination';
import logger from '../utils/logger';
import { ApiResponse, PaginatedApiResponse } from '../types/api';

/**
 * Servicio base para paginación que pueden extender otros servicios
 */
export abstract class BasePaginationService {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Procesa los parámetros de paginación
   */
  protected processPagination(
    params: PaginationParams,
    defaultLimit: number = 10,
    maxLimit: number = 100
  ): PaginationOptions {
    return processPaginationParams(params, defaultLimit, maxLimit);
  }

  /**
   * Construye la consulta de paginación para Prisma
   */
  protected buildQuery(
    options: PaginationOptions,
    allowedSortFields: string[] = [],
    defaultSortField: string = 'id'
  ): PaginationQuery {
    return buildPaginationQuery(options, allowedSortFields, defaultSortField);
  }

  /**
   * Construye filtros de búsqueda básicos
   */
  protected buildSearchFilters(
    search: string | undefined,
    searchFields: string[]
  ): any {
    return buildSearchFilter(search, searchFields);
  }

  /**
   * Crea un resultado paginado
   */
  protected createResult<T>(
    data: T[],
    total: number,
    options: PaginationOptions
  ): PaginatedResult<T> {
    return createPaginatedResult(data, total, options);
  }

  /**
   * Log de rendimiento para consultas
   */
  protected logPerformance(
    operation: string,
    queryTime: number,
    totalTime: number,
    options: PaginationOptions,
    total: number
  ): void {
    const isSlowQuery = queryTime > 500;
    const logLevel = isSlowQuery ? 'warn' : 'info';

    logger[logLevel](`Pagination ${operation}`, {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
      queryTime: `${queryTime}ms`,
      totalTime: `${totalTime}ms`,
      hasSearch: !!options.search,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
    });
  }

  /**
   * Método abstracto que deben implementar los servicios hijos
   */
  abstract findMany(params: PaginationParams, additionalFilters?: any): Promise<PaginatedResult<any>>;
}

/**
 * Interfaz para servicios que implementan paginación
 */
export interface IPaginationService<T> {
  findMany(params: PaginationParams, additionalFilters?: any): Promise<PaginatedResult<T>>;
}

/**
 * Tipo para opciones de consulta con paginación
 */
export interface PaginationQueryOptions {
  where?: any;
  select?: any;
  include?: any;
}

/**
 * Helper para ejecutar consultas paginadas de manera estándar
 */
export async function executePaginatedQuery<T>(
  prisma: any,
  model: string,
  options: PaginationOptions,
  queryOptions: PaginationQueryOptions = {}
): Promise<{ data: T[]; total: number }> {
  const query = buildPaginationQuery(options, [], 'id');

  const [data, total] = await Promise.all([
    prisma[model].findMany({
      where: queryOptions.where,
      select: queryOptions.select,
      include: queryOptions.include,
      skip: query.skip,
      take: query.take,
      orderBy: query.orderBy,
    }),
    prisma[model].count({
      where: queryOptions.where,
    }),
  ]);

  return { data, total };
}