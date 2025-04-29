import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const mermas = await prisma.merma.findMany({
    include: {
      product: true,
    },
    orderBy: {date: 'desc'},
  });
  res.json(mermas);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const merma = await prisma.merma.findUnique({
    where: {id: Number(id)},
    include: {product: true},
  });
  if (!merma) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(merma);
};

export const create = async (req: Request, res: Response) => {
  const {
    product_id,
    quantity,
    type,
    date,
    value,
    responsible_id,
    observations,
    is_automated,
    kardex_id,
  } = req.body;

  const merma = await prisma.merma.create({
    data: {
      product_id,
      quantity,
      type,
      date,
      value,
      responsible_id,
      observations,
      is_automated,
      kardex_id,
    },
  });

  res.status(201).json(merma);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    quantity,
    type,
    date,
    value,
    responsible_id,
    observations,
    is_automated,
    kardex_id,
  } = req.body;

  const merma = await prisma.merma.update({
    where: {id: Number(id)},
    data: {
      quantity,
      type,
      date,
      value,
      responsible_id,
      observations,
      is_automated,
      kardex_id,
    },
  });

  res.json(merma);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.merma.delete({where: {id: Number(id)}});
  res.status(204).send();
};
