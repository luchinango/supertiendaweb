import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const orders = await prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      product: true,
      purchase_order_items: true,
    },
    orderBy: {created_at: 'desc'},
  });
  res.json(orders);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const order = await prisma.purchaseOrder.findUnique({
    where: {id: Number(id)},
    include: {
      supplier: true,
      product: true,
      purchase_order_items: true,
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
    product_id,
    supplier_id,
    quantity,
    status,
    payment_type,
    total_amount,
  } = req.body;

  const order = await prisma.purchaseOrder.create({
    data: {
      product_id,
      supplier_id,
      quantity,
      status,
      payment_type,
      total_amount,
    },
  });

  res.status(201).json(order);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    product_id,
    supplier_id,
    quantity,
    status,
    payment_type,
    total_amount,
  } = req.body;

  const order = await prisma.purchaseOrder.update({
    where: {id: Number(id)},
    data: {
      product_id,
      supplier_id,
      quantity,
      status,
      payment_type,
      total_amount,
      created_at: new Date(),
    },
  });

  res.json(order);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.purchaseOrder.delete({where: {id: Number(id)}});
  res.status(204).send();
};
