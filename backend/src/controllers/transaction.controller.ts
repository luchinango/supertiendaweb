import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const transactions = await prisma.transaction.findMany({
    include: {
      customer: true,
      user: true,
      cart: true,
      transactionItems: true,
    },
    orderBy: {created_at: 'desc'},
  });
  res.json(transactions);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const transaction = await prisma.transaction.findUnique({
    where: {id: Number(id)},
    include: {
      customer: true,
      user: true,
      cart: true,
      transactionItems: true,
    },
  });
  if (!transaction) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(transaction);
};

export const create = async (req: Request, res: Response) => {
  const {
    customer_id,
    user_id,
    amount,
    type,
    reference,
    notes,
    cart_id,
  } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      customer_id,
      user_id,
      amount,
      type,
      reference,
      notes,
      cart_id,
    },
  });

  res.status(201).json(transaction);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    amount,
    type,
    reference,
    notes,
  } = req.body;

  const transaction = await prisma.transaction.update({
    where: {id: Number(id)},
    data: {
      amount,
      type,
      reference,
      notes,
    },
  });

  res.json(transaction);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.transaction.delete({where: {id: Number(id)}});
  res.status(204).send();
};
