import { PaginationParams, PaginationOptions, PaginationQuery, PaginationMeta } from '../types/pagination';

/**
 * Procesa los parámetros de paginación y aplica valores por defecto
 */
export function processPaginationParams(
  params: PaginationParams,
  defaultLimit: number = 10,
  maxLimit: number = 100
): PaginationOptions {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(maxLimit, Math.max(1, params.limit || defaultLimit));
  const search = params.search?.trim() || undefined;
  const sortBy = params.sortBy?.trim() || undefined;
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';

  return {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  };
}

/**
 * Convierte opciones de paginación a query de Prisma
 */
export function buildPaginationQuery(
  options: PaginationOptions,
  allowedSortFields: string[] = [],
  defaultSortField: string = 'id'
): PaginationQuery {
  const skip = (options.page - 1) * options.limit;
  const take = options.limit;

  let orderBy: any = undefined;
  if (options.sortBy && allowedSortFields.includes(options.sortBy)) {
    orderBy = { [options.sortBy]: options.sortOrder };
  }

  return { skip, take, orderBy };
}

/**
 * Crea metadatos de paginación
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const nextPage = hasNextPage ? page + 1 : null;
  const prevPage = hasPrevPage ? page - 1 : null;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  };
}

/**
 * Función helper para crear respuestas paginadas
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  options: PaginationOptions
) {
  const meta = createPaginationMeta(total, options.page, options.limit);

  return {
    data,
    meta,
  };
}

export const createPaginatedResult = createPaginatedResponse;

/**
 * Aplica filtros de búsqueda a campos específicos
 */
export function applySearchFilter(
  search: string | undefined,
  searchFields: string[]
): any {
  if (!search || !searchFields.length) {
    return {};
  }

  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    })),
  };
}

export const buildSearchFilter = applySearchFilter;

/**
 * Configuraciones específicas por entidad
 */
export const PAGINATION_CONFIGS = {
  users: {
    defaultLimit: 10,
    maxLimit: 50,
    allowedSortFields: ['id', 'username', 'createdAt', 'status'],
    defaultSortField: 'id',
    searchFields: ['username'],
    relationSearchFields: {
      employee: ['firstName', 'lastName'],
    },
  },
  products: {
    defaultLimit: 20,
    maxLimit: 100,
    allowedSortFields: ['id', 'name', 'createdAt', 'price', 'stock'],
    defaultSortField: 'name',
    searchFields: ['name', 'description', 'sku'],
  },
  sales: {
    defaultLimit: 15,
    maxLimit: 50,
    allowedSortFields: ['id', 'createdAt', 'total', 'status'],
    defaultSortField: 'createdAt',
    searchFields: ['invoiceNumber'],
  },
  customers: {
    defaultLimit: 15,
    maxLimit: 75,
    allowedSortFields: ['id', 'firstName', 'lastName', 'createdAt'],
    defaultSortField: 'firstName',
    searchFields: ['firstName', 'lastName', 'email', 'phone'],
  },
  suppliers: {
    defaultLimit: 15,
    maxLimit: 75,
    allowedSortFields: ['id', 'name', 'createdAt', 'status'],
    defaultSortField: 'name',
    searchFields: ['name', 'email', 'phone', 'contactPerson'],
  },
  employees: {
    defaultLimit: 15,
    maxLimit: 50,
    allowedSortFields: ['id', 'firstName', 'lastName', 'createdAt', 'position'],
    defaultSortField: 'firstName',
    searchFields: ['firstName', 'lastName', 'email', 'position'],
  },
} as const;

/**
 * Obtiene la configuración de paginación para una entidad específica
 */
export function getEntityPaginationConfig(entity: keyof typeof PAGINATION_CONFIGS) {
  return PAGINATION_CONFIGS[entity];
}
