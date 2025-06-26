/**
 * Validar parámetros numéricos
 */
export function validateNumericParam(value: any, paramName: string): number {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    throw new Error(`${paramName} inválido`);
  }
  return numValue;
}

/**
 * Validar ID de parámetro de ruta
 */
export function validatePathId(id: any): number {
  return validateNumericParam(id, 'ID');
}

/**
 * Validar parámetros de paginación básicos
 */
export function validateBasicPagination(page?: any, limit?: any) {
  const validatedPage = page ? validateNumericParam(page, 'page') : 1;
  const validatedLimit = limit ? validateNumericParam(limit, 'limit') : 10;

  if (validatedPage < 1) {
    throw new Error('La página debe ser mayor a 0');
  }

  if (validatedLimit < 1 || validatedLimit > 100) {
    throw new Error('El límite debe estar entre 1 y 100');
  }

  return {
    page: validatedPage,
    limit: validatedLimit,
  };
}

/**
 * Limpiar filtros undefined
 */
export function cleanFilters<T extends Record<string, any>>(filters: T): Partial<T> {
  const cleaned: Partial<T> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key as keyof T] = value;
    }
  }

  return cleaned;
}
