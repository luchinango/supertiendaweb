import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const items = await prisma.consignmentItem.findMany({
    include: {
      consignment: true,
      product: true,
    },
    orderBy: {created_at: 'desc'},
  });
  res.json(items);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const item = await prisma.consignmentItem.findUnique({
    where: {id: Number(id)},
    include: {consignment: true, product: true},
  });
  if (!item) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(item);
};

export const create = async (req: Request, res: Response) => {
  const {
    consignment_id,
    product_id,
    quantity_delivered,
    price_at_time,
    quantity_sent,
    quantity_returned,
  } = req.body;

  const item = await prisma.consignmentItem.create({
    data: {
      consignment_id,
      product_id,
      quantity_delivered,
      price_at_time,
      quantity_sent,
      quantity_returned,
    },
  });

  res.status(201).json(item);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    quantity_delivered,
    quantity_sold,
    price_at_time,
    quantity_sent,
    quantity_returned,
  } = req.body;

  const item = await prisma.consignmentItem.update({
    where: {id: Number(id)},
    data: {
      quantity_delivered,
      quantity_sold,
      price_at_time,
      quantity_sent,
      quantity_returned,
      created_at: new Date(),
    },
  });

  res.json(item);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.consignmentItem.delete({where: {id: Number(id)}});
  res.status(204).send();
};
