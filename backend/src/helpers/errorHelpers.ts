import { ValidationError, NotFoundError, ConflictError } from '../errors';
import { createErrorResponse } from './responseHelpers';

/**
 * Tipo para mapear errores comunes
 */
export interface ErrorMapping {
  [key: string]: {
    status: number;
    message: string;
  };
}

/**
 * Manejo estándar de errores en controladores
 * Retorna una respuesta de error en lugar de hacer throw
 */
export function handleControllerError(error: any, setStatus: (status: number) => void): never {
  if (error instanceof ValidationError) {
    setStatus(400);
    throw error;
  }

  if (error instanceof NotFoundError) {
    setStatus(404);
    throw error;
  }

  if (error instanceof ConflictError) {
    setStatus(409);
    throw error;
  }

  // Error genérico
  setStatus(500);
  throw new Error('Error interno del servidor');
}

/**
 * Crear error de validación con contexto
 */
export function createValidationError(field: string, value: any, reason: string): ValidationError {
  return new ValidationError(`Error en campo '${field}': ${reason}. Valor recibido: ${value}`);
}

/**
 * Verificar existencia y lanzar NotFoundError si no existe
 */
export function ensureExists<T>(
  entity: T | null | undefined,
  entityName: string,
  id?: string | number
): T {
  if (!entity) {
    const message = id
      ? `${entityName} con ID ${id} no encontrado`
      : `${entityName} no encontrado`;
    throw new NotFoundError(message);
  }
  return entity;
}

/**
 * Validar que una entidad no exista (para evitar duplicados)
 */
export function ensureNotExists<T>(
  entity: T | null | undefined,
  entityName: string,
  field: string,
  value: any
): void {
  if (entity) {
    throw new ConflictError(`Ya existe un ${entityName} con ${field}: ${value}`);
  }
}
