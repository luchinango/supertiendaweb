import { Request, Response, NextFunction } from 'express';

interface ProductRequest {
  nombre: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  sku: string;
  barcode: string;
  category: string;
  subcategory: string;
  brand: string;
  unidad: string;
  minStock: number;
  maxStock: number;
  actualStock: number;
  fechaExpiracion: Date;
  imagen: string;
}

export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  const product = req.body as ProductRequest;

  // Validaciones básicas
  if (!product.nombre || product.nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  if (!product.precio_venta || product.precio_venta <= 0) {
    return res.status(400).json({ error: 'El precio de venta debe ser mayor a 0' });
  }

  if (!product.precio_compra || product.precio_compra <= 0) {
    return res.status(400).json({ error: 'El precio de compra debe ser mayor a 0' });
  }

  if (product.actualStock < 0) {
    return res.status(400).json({ error: 'El stock no puede ser negativo' });
  }

  if (product.minStock > product.maxStock) {
    return res.status(400).json({ error: 'El stock mínimo no puede ser mayor al stock máximo' });
  }

  // Si todas las validaciones pasan
  next();
};