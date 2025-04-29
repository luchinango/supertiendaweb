import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const items = await prisma.cartItem.findMany({
    include: {
      cart: true,
      products: true,
    },
    orderBy: {id: 'asc'},
  });
  res.json(items);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const item = await prisma.cartItem.findUnique({
    where: {id: Number(id)},
    include: {
      cart: true,
      products: true,
    },
  });
  if (!item) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(item);
};

export const create = async (req: Request, res: Response) => {
  const {cart_id, product_id, quantity, price_at_time} = req.body;

  const cartItem = await prisma.cartItem.create({
    data: {
      cart_id,
      product_id,
      quantity,
      price_at_time,
    },
  });

  res.status(201).json(cartItem);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {quantity, price_at_time} = req.body;

  const cartItem = await prisma.cartItem.update({
    where: {id: Number(id)},
    data: {
      quantity,
      price_at_time,
    },
  });

  res.json(cartItem);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.cartItem.delete({where: {id: Number(id)}});
  res.status(204).send();
};
