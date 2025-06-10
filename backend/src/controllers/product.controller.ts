import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {name: 'asc'},
  });
  res.json(products);
};

export const getByCategory = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.categoryId);

  if (isNaN(categoryId)) {
    res.status(400).json({message: 'categoryId inválido'});
    return
  }

  try {
    const products = await prisma.product.findMany({
      where: {categoryId: categoryId},
      include: {category: true}
    });

    if (products.length === 0) {
      res.status(404).json({message: 'No se encontraron productos en esta categoría'});
      return
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({message: 'Error interno del servidor'});
  }
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const product = await prisma.product.findUnique({
    where: {id: Number(id)},
    include: {category: true},
  });
  if (!product) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(product);
};

export const create = async (req: Request, res: Response) => {

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
    category,
    description,
  } = req.body;

  const exists = await prisma.product.findUnique({where: {barcode}});
  if (exists) {
    res.status(400).json({message: 'Ya existe un producto con ese código de barras'});
    return;
  }
  let categoryId = 0;
  if (category) {
    let categoryExists = await prisma.category.findUnique({where: {name: category}});
    if (!categoryExists) {
      categoryExists = await prisma.category.create({data: {name: category}});
    }
    categoryId = categoryExists?.id;
  }

  const product = await prisma.product.create({
    data: {
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
    },
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

  const product = await prisma.product.update({
    where: {id: Number(id)},
    data: {
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
    },
  });

  res.json(product);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.product.delete({where: {id: Number(id)}});
  res.status(204).send();
};
