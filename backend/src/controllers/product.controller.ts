import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      supplier: true,
    },
    orderBy: {name: 'asc'},
  });
  res.json(products);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const product = await prisma.product.findUnique({
    where: {id: Number(id)},
    include: {category: true, supplier: true},
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
    price,
    cost,
    stock,
    barcode,
    category,
    created_at,
    updated_at,
  } = req.body;

  const exists = await prisma.product.findUnique({where: {barcode}});
  if (exists) {
    res.status(400).json({message: 'Ya existe un producto con ese código de barras'});
    return;
  }
  let category_id = 0;
  if (category) {
    let categoryExists = await prisma.category.findUnique({where: {name: category}});
    if (!categoryExists) {
      categoryExists = await prisma.category.create({data: {name: category}});
    }
    category_id = categoryExists?.id;
  }

  const product = await prisma.product.create({
    data: {
      name,
      price,
      cost,
      stock,
      barcode,
      category_id,
      created_at,
      updated_at,
    },
  });

  res.status(201).json(product);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    name,
    price,
    purchase_price,
    sale_price,
    sku,
    barcode,
    brand,
    unit,
    min_stock,
    max_stock,
    stock,
    expiration_date,
    image,
    status,
    shelf_life_days,
    is_organic,
    supplier_id,
    category_id,
    description,
  } = req.body;

  const product = await prisma.product.update({
    where: {id: Number(id)},
    data: {
      name,
      price,
      purchase_price,
      sale_price,
      sku,
      barcode,
      brand,
      unit,
      min_stock,
      max_stock,
      stock,
      expiration_date,
      image,
      status,
      shelf_life_days,
      is_organic,
      supplier_id,
      category_id,
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
