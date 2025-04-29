import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const items = await prisma.transactionItem.findMany({
    include: {
      products: true,
      transactions: true,
    },
    orderBy: {id: 'asc'},
  });
  res.json(items);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const item = await prisma.transactionItem.findUnique({
    where: {id: Number(id)},
    include: {
      products: true,
      transactions: true,
    },
  });
  if (!item) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(item);
};

export const create = async (req: Request, res: Response) => {
  const {transaction_id, product_id, quantity, price_at_sale} = req.body;

  const transactionItem = await prisma.transactionItem.create({
    data: {
      transaction_id,
      product_id,
      quantity,
      price_at_sale,
    },
  });

  res.status(201).json(transactionItem);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {quantity, price_at_sale} = req.body;

  const transactionItem = await prisma.transactionItem.update({
    where: {id: Number(id)},
    data: {
      quantity,
      price_at_sale,
    },
  });

  res.json(transactionItem);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.transactionItem.delete({where: {id: Number(id)}});
  res.status(204).send();
};
