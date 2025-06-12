import {Request, Response} from 'express';
import {productService} from '../services/productService';
import {
  ProductQueryParams,
  CreateProductRequest,
  UpdateProductRequest,
  ProductPathParams,
  ProductErrorResponse
} from '../types/productTypes';

export const getAll = async (req: Request<{}, {}, {}, ProductQueryParams>, res: Response) => {
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
    maxPrice
  } = req.query;

  const result = await productService.getProducts({
    page: Number(page),
    limit: Number(limit),
    search: search as string,
    categoryId: categoryId ? Number(categoryId) : undefined,
    status: status as string,
    isActive: isActive,
    minStock: minStock ? Number(minStock) : undefined,
    maxStock: maxStock ? Number(maxStock) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined
  });
  res.json(result);
};

export const getByCategory = async (req: Request<ProductPathParams>, res: Response) => {
  const categoryId = Number(req.params.categoryId);
  if (isNaN(categoryId)) {
    const errorResponse: ProductErrorResponse = {message: 'categoryId inválido'};
    res.status(400).json(errorResponse);
    return;
  }
  try {
    const result = await productService.getProducts({categoryId});
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    const errorResponse: ProductErrorResponse = {message: 'Error interno del servidor'};
    res.status(500).json(errorResponse);
  }
};

export const getById = async (req: Request<ProductPathParams>, res: Response) => {
  const {id} = req.params;
  const product = await productService.getProductById(Number(id));
  if (!product) {
    const errorResponse: ProductErrorResponse = {message: 'No encontrado'};
    res.status(404).json(errorResponse);
    return;
  }
  res.json(product);
};

export const create = async (req: Request<{}, {}, CreateProductRequest>, res: Response) => {
  const {
    name,
    costPrice,
    sellingPrice,
    sku,
    barcode,
    brand,
    unit,
    minStock,
    maxStock,
    reorderPoint,
    expiryDate,
    status,
    categoryId,
    description,
  } = req.body;

  const exists = await productService.checkBarcodeExists(barcode);
  if (exists) {
    const errorResponse: ProductErrorResponse = {message: 'Ya existe un producto con ese código de barras'};
    res.status(400).json(errorResponse);
    return;
  }

  const product = await productService.createProduct({
    name,
    costPrice,
    sellingPrice,
    sku,
    barcode,
    brand,
    unit,
    minStock,
    maxStock,
    reorderPoint,
    expiryDate,
    status,
    categoryId,
    description,
  });

  res.status(201).json(product);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    name,
    costPrice,
    sellingPrice,
    sku,
    barcode,
    brand,
    unit,
    minStock,
    maxStock,
    reorderPoint,
    expiryDate,
    status,
    categoryId,
    description,
  } = req.body;

  const product = await productService.updateProduct(Number(id), {
    name,
    costPrice,
    sellingPrice,
    sku,
    barcode,
    brand,
    unit,
    minStock,
    maxStock,
    reorderPoint,
    expiryDate,
    status,
    categoryId,
    description,
  });

  res.json(product);
};

export const remove = async (req: Request<ProductPathParams>, res: Response) => {
  const {id} = req.params;
  await productService.softDeleteProduct(Number(id));
  res.status(204).send();
};
