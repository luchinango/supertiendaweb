import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const orders = await prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      items: {
        include: {
          product: true
        }
      },
    },
    orderBy: {createdAt: 'desc'},
  });
  res.json(orders);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const order = await prisma.purchaseOrder.findUnique({
    where: {id: Number(id)},
    include: {
      supplier: true,
      items: {
        include: {
          product: true
        }
      },
    },
  });
  if (!order) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(order);
};

export const create = async (req: Request, res: Response) => {
  const {
    supplierId,
    poNumber,
    status,
    orderDate,
    expectedDate,
    subtotal,
    taxAmount,
    totalAmount,
    notes,
  } = req.body;

  const order = await prisma.purchaseOrder.create({
    data: {
      supplierId,
      poNumber,
      status,
      orderDate,
      expectedDate,
      subtotal,
      taxAmount,
      totalAmount,
      notes,
    },
  });

  res.status(201).json(order);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    supplierId,
    poNumber,
    status,
    orderDate,
    expectedDate,
    subtotal,
    taxAmount,
    totalAmount,
    notes,
  } = req.body;

  const order = await prisma.purchaseOrder.update({
    where: {id: Number(id)},
    data: {
      supplierId,
      poNumber,
      status,
      orderDate,
      expectedDate,
      subtotal,
      taxAmount,
      totalAmount,
      notes,
    },
  });

  res.json(order);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.purchaseOrder.delete({where: {id: Number(id)}});
  res.status(204).send();
};
