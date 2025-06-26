import { Request, Response } from 'express';
import { ProductErrorResponse } from '../types/productTypes';

/**
 * Validar categoryId numérico
 */
export function validateCategoryId(categoryId: string | undefined): number {
  if (!categoryId) {
    throw new Error('categoryId es requerido');
  }
  const id = Number(categoryId);
  if (isNaN(id)) {
    throw new Error('categoryId inválido');
  }
  return id;
}

/**
 * Enviar respuesta de error para productos
 */
export function sendProductError(
  res: Response,
  status: number,
  message: string
): void {
  const errorResponse: ProductErrorResponse = { message };
  res.status(status).json(errorResponse);
}

/**
 * Convertir query params a filtros de productos
 */
export function buildProductFilters(query: any) {
  const {
    page = 1,
    limit = 10,
    search,
    categoryId,
    status,
    isActive,
    minStock,
    maxStock,
    minPrice,
    maxPrice,
  } = query;

  return {
    page: Number(page),
    limit: Number(limit),
    search: search as string,
    categoryId: categoryId ? Number(categoryId) : undefined,
    status: status as string,
    isActive: isActive,
    minStock: minStock ? Number(minStock) : undefined,
    maxStock: maxStock ? Number(maxStock) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };
}

/**
 * Manejar errores de productos de forma consistente
 */
export function handleProductError(error: any, res: Response): void {
  console.error('Error en operación de producto:', error);
  sendProductError(res, 500, 'Error interno del servidor');
}
