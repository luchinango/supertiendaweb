import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const items = await prisma.purchaseOrderItem.findMany({
    include: {
      product: true,
      purchaseOrder: true,
    },
    orderBy: { id: 'asc' },
  });
  res.json(items);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await prisma.purchaseOrderItem.findUnique({
    where: { id: Number(id) },
    include: { product: true, purchaseOrder: true },
  });
  if (!item) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(item);
};

export const create = async (req: Request, res: Response) => {
  const { purchaseOrderId, productId, quantity, unitCost } = req.body;

  const item = await prisma.purchaseOrderItem.create({
    data: {
      purchaseOrderId,
      productId,
      quantity,
      unitCost,
    },
  });

  res.status(201).json(item);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, unitCost } = req.body;

  const item = await prisma.purchaseOrderItem.update({
    where: { id: Number(id) },
    data: {
      quantity,
      unitCost,
    },
  });

  res.json(item);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.purchaseOrderItem.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
