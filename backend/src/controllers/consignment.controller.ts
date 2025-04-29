import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const consignments = await prisma.consignment.findMany({
    include: {
      supplier: true,
      user: true,
      consignment_items: true,
    },
    orderBy: { created_at: 'desc' },
  });
  res.json(consignments);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const consignment = await prisma.consignment.findUnique({
    where: { id: Number(id) },
    include: {
      supplier: true,
      user: true,
      consignment_items: true,
    },
  });
  if (!consignment) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(consignment);
};

export const create = async (req: Request, res: Response) => {
  const {
    supplier_id,
    start_date,
    end_date,
    total_value,
    status,
    user_id,
  } = req.body;

  const consignment = await prisma.consignment.create({
    data: {
      supplier_id,
      start_date,
      end_date,
      total_value,
      status,
      user_id,
    },
  });

  res.status(201).json(consignment);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    supplier_id,
    start_date,
    end_date,
    total_value,
    sold_value,
    status,
    user_id,
  } = req.body;

  const consignment = await prisma.consignment.update({
    where: { id: Number(id) },
    data: {
      supplier_id,
      start_date,
      end_date,
      total_value,
      sold_value,
      status,
      user_id,
      updated_at: new Date(),
    },
  });

  res.json(consignment);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.consignment.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
