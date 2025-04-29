import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const kardexEntries = await prisma.kardex.findMany({
    include: {
      product: true,
    },
    orderBy: { movement_date: 'desc' },
  });
  res.json(kardexEntries);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const kardex = await prisma.kardex.findUnique({
    where: { id: Number(id) },
    include: { product: true },
  });
  if (!kardex) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(kardex);
};

export const create = async (req: Request, res: Response) => {
  const {
    product_id,
    movement_type,
    quantity,
    unit_price,
    reference_id,
    reference_type,
    stock_after,
  } = req.body;

  const entry = await prisma.kardex.create({
    data: {
      product_id,
      movement_type,
      quantity,
      unit_price,
      reference_id,
      reference_type,
      stock_after,
    },
  });

  res.status(201).json(entry);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    movement_type,
    quantity,
    unit_price,
    reference_id,
    reference_type,
    stock_after,
  } = req.body;

  const entry = await prisma.kardex.update({
    where: { id: Number(id) },
    data: {
      movement_type,
      quantity,
      unit_price,
      reference_id,
      reference_type,
      stock_after,
      movement_date: new Date(),
    },
  });

  res.json(entry);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.kardex.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
