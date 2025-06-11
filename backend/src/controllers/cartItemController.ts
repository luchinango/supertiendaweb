import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const items = await prisma.cartItem.findMany({
    include: {
      cart: true,
      product: true,
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
      product: true,
    },
  });
  if (!item) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(item);
};

export const create = async (req: Request, res: Response) => {
  const {cartId, productId, quantity, unitPrice} = req.body;

  // Calcular totalPrice
  const totalPrice = quantity * unitPrice;

  const cartItem = await prisma.cartItem.create({
    data: {
      cartId,
      productId,
      quantity,
      unitPrice,
      totalPrice,
      taxRate: 13, // IVA 13% por defecto
      taxAmount: totalPrice * 0.13,
    },
  });

  res.status(201).json(cartItem);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {quantity, unitPrice} = req.body;

  const cartItem = await prisma.cartItem.update({
    where: {id: Number(id)},
    data: {
      quantity,
      unitPrice,
    },
  });

  res.json(cartItem);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.cartItem.delete({where: {id: Number(id)}});
  res.status(204).send();
};
