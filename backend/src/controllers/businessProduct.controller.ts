import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const businessProducts = await prisma.businessProduct.findMany({
    include: {
      business: true,
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(businessProducts);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await prisma.businessProduct.findUnique({
    where: { id: Number(id) },
    include: { business: true, product: true },
  });
  if (!record) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(record);
};

export const create = async (req: Request, res: Response) => {
  const { businessId, productId, customPrice, actualStock } = req.body;

  // Validar que no exista combinación repetida
  const exists = await prisma.businessProduct.findFirst({
    where: { businessId, productId },
  });
  if (exists) {
    res.status(400).json({ message: 'Este producto ya está asignado a este negocio' });
    return;
  }

  const record = await prisma.businessProduct.create({
    data: {
      businessId,
      productId,
      customPrice,
      actualStock,
    },
  });

  res.status(201).json(record);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { customPrice, actualStock } = req.body;

  const record = await prisma.businessProduct.update({
    where: { id: Number(id) },
    data: {
      customPrice,
      actualStock,
      createdAt: new Date(),
    },
  });

  res.json(record);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.businessProduct.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
