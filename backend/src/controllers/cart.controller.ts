import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const carts = await prisma.cart.findMany({
    include: {
      customer: true,
      cartItems: true,
    },
    orderBy: {created_at: 'desc'},
  });
  res.json(carts);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const cart = await prisma.cart.findUnique({
    where: {id: Number(id)},
    include: {
      customer: true,
      cartItems: true,
    },
  });
  if (!cart) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(cart);
};

export const create = async (req: Request, res: Response) => {
  const {customer_id} = req.body;

  const cart = await prisma.cart.create({
    data: {
      customer_id,
    },
  });

  res.status(201).json(cart);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {customer_id} = req.body;

  const cart = await prisma.cart.update({
    where: {id: Number(id)},
    data: {
      customer_id,
      created_at: new Date(),
    },
  });

  res.json(cart);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.cart.delete({where: {id: Number(id)}});
  res.status(204).send();
};
