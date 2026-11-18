import { ForbiddenError } from '../errors';

/**
 * Contención P1-F (T1 estricta): el catálogo maestro Product/Category
 * no es mutable por usuarios de empresa. No hay excepción PLATFORM_USER_IDS.
 * La arquitectura híbrida C se implementará en una fase posterior con migración.
 */
export const CATALOG_MASTER_MUTATION_FORBIDDEN =
  'Mutación del catálogo maestro bloqueada. Los usuarios de empresa no pueden crear, modificar ni eliminar productos o categorías globales (contención P1-F).';

export function rejectCatalogMasterMutation(): never {
  throw new ForbiddenError(CATALOG_MASTER_MUTATION_FORBIDDEN);
}

/**
 * Filtro Prisma conservador: solo productos vinculados a la empresa vía BusinessProduct.
 * No se infiere propiedad por “único BP”; sin vínculo explícito → no visible.
 */
/** Filtro de BusinessProduct comercialmente activo (soft-delete P2-C0.1A). */
export function activeBusinessProductWhere(businessId?: number) {
  return {
    deletedAt: null,
    ...(businessId !== undefined ? { businessId } : {}),
  };
}

export function productVisibleToBusinessWhere(businessId: number) {
  return {
    deletedAt: null,
    businessProducts: {
      some: { businessId, deletedAt: null },
    },
  };
}

/**
 * Categorías visibles: las que tienen al menos un producto no borrado
 * vinculado a la empresa vía BusinessProduct activo.
 */
export function categoryVisibleToBusinessWhere(businessId: number) {
  return {
    deletedAt: null,
    products: {
      some: {
        deletedAt: null,
        businessProducts: {
          some: { businessId, deletedAt: null },
        },
      },
    },
  };
}
