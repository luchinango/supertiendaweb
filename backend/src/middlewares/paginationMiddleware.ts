import { Request, Response, NextFunction } from 'express';
import { PaginationParams } from '../types/pagination';
import { processPaginationParams } from '../utils/pagination';

/**
 * Extiende el objeto Request para incluir paginación
 */
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        search?: string;
        sortBy?: string;
        sortOrder: 'asc' | 'desc';
      };
    }
  }
}

/**
 * Middleware para procesar parámetros de paginación
 */
export function paginationMiddleware(
  defaultLimit: number = 10,
  maxLimit: number = 100
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: PaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const options = processPaginationParams(params, defaultLimit, maxLimit);

      req.pagination = options;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Parámetros de paginación inválidos',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };
}

/**
 * Middleware específico para diferentes entidades
 */
export const usersPaginationMiddleware = paginationMiddleware(10, 50);
export const productsPaginationMiddleware = paginationMiddleware(20, 100);
export const salesPaginationMiddleware = paginationMiddleware(15, 50);
export const customersPaginationMiddleware = paginationMiddleware(15, 75);
export const suppliersPaginationMiddleware = paginationMiddleware(15, 75);
export const employeesPaginationMiddleware = paginationMiddleware(15, 50);

/**
 * Función helper para validar parámetros de paginación en controladores
 */
export function validatePaginationParams(
  page?: number,
  limit?: number,
  search?: string,
  sortBy?: string,
  sortOrder?: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
    errors.push('El parámetro "page" debe ser un número entero mayor a 0');
  }

  if (limit !== undefined && (limit < 1 || limit > 100 || !Number.isInteger(limit))) {
    errors.push('El parámetro "limit" debe ser un número entero entre 1 y 100');
  }

  if (search !== undefined && typeof search !== 'string') {
    errors.push('El parámetro "search" debe ser una cadena de texto');
  }

  if (sortBy !== undefined && typeof sortBy !== 'string') {
    errors.push('El parámetro "sortBy" debe ser una cadena de texto');
  }

  if (sortOrder !== undefined && !['asc', 'desc'].includes(sortOrder)) {
    errors.push('El parámetro "sortOrder" debe ser "asc" o "desc"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Decorator para controladores que usan paginación
 */
export function WithPagination(entityConfig?: {
  defaultLimit?: number;
  maxLimit?: number;
  allowedSortFields?: string[];
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Aquí podrías agregar lógica adicional de validación si es necesario
      return method.apply(this, args);
    };

    return descriptor;
  };
}